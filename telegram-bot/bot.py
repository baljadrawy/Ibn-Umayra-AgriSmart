#!/usr/bin/env python3
"""
🌿 بوت تلقرام - تقويم ابن عميرة الزراعي
Agricultural Calendar Bot — Ibn Umaira System
"""

import os
import json
import logging
import asyncio
import aiohttp
from datetime import datetime, time
from pathlib import Path
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup, BotCommand
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    ContextTypes, ConversationHandler
)
from telegram.constants import ParseMode

from nawaa_data import (
    CLIMATE_ZONES, CITIES_COORDINATES, NAWAA_TEMPERATURE, CALENDAR_2026,
    get_adjusted_nawaa, get_zone_for_city, get_nearest_city,
    get_farming_score, score_label
)

# ──────────────────────────────────────────────
# الإعداد
# ──────────────────────────────────────────────
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

# ──────────────────────────────────────────────
# تتبع المستخدمين
# ──────────────────────────────────────────────
USERS_FILE = Path("data/users.json")

def load_users() -> dict:
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text())
    return {}

def save_user(user_id: int, name: str, username: str) -> bool:
    """يحفظ المستخدم ويعيد True إذا كان جديداً"""
    USERS_FILE.parent.mkdir(exist_ok=True)
    users = load_users()
    is_new = str(user_id) not in users
    users[str(user_id)] = {
        "name": name,
        "username": username or "",
        "first_seen": users.get(str(user_id), {}).get("first_seen", datetime.now().isoformat()),
        "last_seen": datetime.now().isoformat(),
    }
    USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2))
    return is_new

# ──────────────────────────────────────────────
# Open-Meteo: جلب الطقس الحي
# ──────────────────────────────────────────────
async def fetch_live_weather(lat: float, lon: float) -> dict | None:
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current_weather=true"
        f"&timezone=auto"
    )
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    cw = data.get("current_weather", {})
                    return {
                        "temp": round(cw.get("temperature", 0)),
                        "wind": round(cw.get("windspeed", 0)),
                        "wmo": cw.get("weathercode", 0),
                    }
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
    return None


def wmo_to_arabic(code: int) -> str:
    """تحويل رمز WMO إلى وصف عربي"""
    if code == 0:
        return "صحو ☀️"
    elif code in (1, 2, 3):
        return "غائم جزئياً 🌤"
    elif code in range(45, 50):
        return "ضباب 🌫"
    elif code in range(51, 68):
        return "أمطار خفيفة 🌧"
    elif code in range(71, 78):
        return "ثلوج 🌨"
    elif code in range(80, 83):
        return "أمطار غزيرة 🌦"
    elif code in range(95, 100):
        return "عواصف رعدية ⛈"
    return "متقلب 🌥"


# ──────────────────────────────────────────────
# حساب نسبة التوافق
# ──────────────────────────────────────────────
def calc_match_score(live: float, expected: float) -> int:
    diff = abs(live - expected)
    tol = 7 if expected > 30 else 5 if expected > 20 else 3
    if diff == 0:
        return 100
    if diff <= tol * 0.5:
        return 90
    if diff <= tol:
        return round(100 - (diff / tol) * 30)
    if diff <= tol * 2:
        return round(70 - (diff / tol) * 15)
    return max(10, round(40 - diff * 2))


def score_emoji(score: int) -> str:
    if score >= 80:
        return "🟢"
    elif score >= 55:
        return "🟡"
    return "🔴"


# ──────────────────────────────────────────────
# لوحة اختيار المنطقة
# ──────────────────────────────────────────────
def zone_keyboard() -> InlineKeyboardMarkup:
    buttons = []
    labels = {
        'highlands': '⛰️ المرتفعات الجبلية',
        'central':   '🌵 الهضبة الوسطى (نجد)',
        'east':      '🌊 السهول الشرقية',
        'west':      '🏖️ السهول الغربية',
        'north':     '❄️ المناطق الشمالية',
    }
    for zid, label in labels.items():
        buttons.append([InlineKeyboardButton(label, callback_data=f"zone:{zid}")])
    return InlineKeyboardMarkup(buttons)


def city_keyboard(zone_id: str) -> InlineKeyboardMarkup:
    cities = CLIMATE_ZONES[zone_id]['cities']
    rows = []
    for i in range(0, len(cities), 3):
        row = [InlineKeyboardButton(c, callback_data=f"city:{c}") for c in cities[i:i+3]]
        rows.append(row)
    rows.append([InlineKeyboardButton("↩️ رجوع", callback_data="back:zones")])
    return InlineKeyboardMarkup(rows)


# ──────────────────────────────────────────────
# مساعد: استخراج offset المنطقة من user_data
# ──────────────────────────────────────────────
def get_user_offset(context: ContextTypes.DEFAULT_TYPE) -> int:
    city = context.user_data.get("city")
    if city:
        zone = get_zone_for_city(city)
        if zone:
            return zone["offset"]
    zone_id = context.user_data.get("zone_id", "highlands")
    return CLIMATE_ZONES.get(zone_id, {}).get("offset", 0)


def get_user_location_label(context: ContextTypes.DEFAULT_TYPE) -> str:
    city = context.user_data.get("city")
    if city:
        return city
    zone_id = context.user_data.get("zone_id", "highlands")
    return CLIMATE_ZONES.get(zone_id, {}).get("name", "المرتفعات الجبلية")


# ──────────────────────────────────────────────
# /start
# ──────────────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    save_user(user.id, user.full_name, user.username)
    name = user.first_name or "أخي المزارع"
    text = (
        f"🌿 *أهلاً {name}!*\n\n"
        "مرحباً بك في *التقويم الزراعي المطور* —\n"
        "نظام زراعي ذكي مبني على تقويم ابن عميرة التراثي، معدَّل آلياً لكل مناطق المملكة مع بيانات الطقس الحي.\n\n"
        "👨‍💻 تطوير: @jadrawy\n\n"
        "📍 *للبدء:* اختر منطقتك لتحصل على توصيات مخصصة\n\n"
        "أو استخدم الأوامر مباشرة:\n"
        "🗓 /today — النجم الحالي وتوصيات اليوم\n"
        "🌡 /weather — الطقس الميداني ومقارنته بالتقويم\n"
        "🌱 /crop — المحاصيل والأنشطة الموصى بها\n"
        "📅 /calendar — قائمة أنجم الشهر الحالي\n"
        "📍 /setlocation — تغيير المدينة أو المنطقة\n"
        "ℹ️ /help — مساعدة\n"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN, reply_markup=zone_keyboard())


# ──────────────────────────────────────────────
# /setlocation
# ──────────────────────────────────────────────
async def setlocation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📍 *اختر منطقتك الجغرافية:*",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=zone_keyboard()
    )


# ──────────────────────────────────────────────
# Callback: اختيار المنطقة / المدينة
# ──────────────────────────────────────────────
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data

    if data.startswith("zone:"):
        zone_id = data.split(":", 1)[1]
        context.user_data["zone_id"] = zone_id
        context.user_data.pop("city", None)
        zone = CLIMATE_ZONES[zone_id]
        await query.edit_message_text(
            f"✅ *{zone['name']}* — تم تحديد المنطقة.\n\n"
            f"💡 {zone['advice']}\n\n"
            "اختر مدينة تحديداً، أو اضغط /today للبدء:",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=city_keyboard(zone_id)
        )

    elif data.startswith("city:"):
        city = data.split(":", 1)[1]
        context.user_data["city"] = city
        zone = get_zone_for_city(city)
        if zone:
            context.user_data["zone_id"] = zone["id"]
        zone_name = zone["name"] if zone else "غير محدد"
        await query.edit_message_text(
            f"📍 *تم تحديد مدينتك: {city}*\n"
            f"🗺️ المنطقة: {zone_name}\n\n"
            "الآن اكتب /today لمعرفة النجم الحالي وتوصيات اليوم 🌿",
            parse_mode=ParseMode.MARKDOWN
        )

    elif data == "back:zones":
        await query.edit_message_text(
            "📍 *اختر منطقتك الجغرافية:*",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=zone_keyboard()
        )


# ──────────────────────────────────────────────
# /today
# ──────────────────────────────────────────────
async def today(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    offset = get_user_offset(context)
    location = get_user_location_label(context)
    nawaa = get_adjusted_nawaa(offset)

    if not nawaa:
        await update.message.reply_text("⚠️ لم يتم العثور على نجم لهذا التاريخ. الرجاء المحاولة لاحقاً.")
        return

    bar_filled = round(nawaa["progress"] / 10)
    bar = "█" * bar_filled + "░" * (10 - bar_filled)

    text = (
        f"🌿 *تقويم ابن عميرة الزراعي*\n"
        f"📍 {location}\n"
        f"{'─' * 30}\n\n"
        f"✨ *نجم {nawaa['name']}* — دورة {nawaa['cycle']}\n"
        f"📅 {nawaa['start_date']} ← {nawaa['end_date']}\n"
        f"⏱ اليوم {nawaa['day_in_nawaa']} من {nawaa['duration']} | متبقي {nawaa['days_remaining']} يوم\n"
        f"`{bar}` {nawaa['progress']}%\n\n"
        f"🌡 *الحرارة المتوقعة:* {nawaa['temp_label']}\n"
        f"💨 *الرياح:* {nawaa['wind']}\n"
        f"🌧 *الأمطار:* {nawaa['rain']}\n\n"
        f"📝 _{nawaa['note']}_\n"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /weather
# ──────────────────────────────────────────────
async def weather(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    city = context.user_data.get("city")
    if not city:
        await update.message.reply_text(
            "📍 الرجاء تحديد مدينتك أولاً عبر /setlocation",
        )
        return

    coords = CITIES_COORDINATES.get(city)
    if not coords:
        await update.message.reply_text("❌ لم يتم العثور على إحداثيات هذه المدينة.")
        return

    await update.message.reply_text(f"⏳ جاري مزامنة الطقس الحي لـ *{city}*...", parse_mode=ParseMode.MARKDOWN)

    lat, lon = coords
    live = await fetch_live_weather(lat, lon)

    if not live:
        await update.message.reply_text("⚠️ تعذّر جلب بيانات الطقس حالياً. الرجاء المحاولة لاحقاً.")
        return

    offset = get_user_offset(context)
    nawaa = get_adjusted_nawaa(offset)
    expected_temp = nawaa["temp_avg"] if nawaa else 21
    score = calc_match_score(live["temp"], expected_temp)
    diff = live["temp"] - expected_temp
    trend = (
        f"⬆️ أعلى بـ +{abs(round(diff))}°" if diff > 2
        else f"⬇️ أقل بـ {abs(round(diff))}°" if diff < -2
        else "↔️ متوافق مع التقويم"
    )

    nawaa_name = f"نجم {nawaa['name']}" if nawaa else "—"
    timestamp = datetime.now().strftime("%H:%M")

    text = (
        f"🌡 *الطقس الميداني — {city}*\n"
        f"🕐 آخر تحديث: {timestamp}\n"
        f"{'─' * 30}\n\n"
        f"🌡 *الحرارة الحية:* {live['temp']}°م\n"
        f"💨 *سرعة الرياح:* {live['wind']} كم/س\n"
        f"🌤 *الحالة:* {wmo_to_arabic(live['wmo'])}\n\n"
        f"📊 *مقارنة بالتقويم ({nawaa_name}):*\n"
        f"• المتوقع: {expected_temp}°م\n"
        f"• الفعلي: {live['temp']}°م ({trend})\n"
        f"• نسبة التوافق: {score_emoji(score)} {score}%\n\n"
    )

    if diff > 5:
        text += "⚠️ *تنبيه:* الحرارة أعلى من المعتاد — كثّف الري المسائي\n"
    elif diff < -5:
        text += "⚠️ *تنبيه:* برد مفاجئ — احمِ الشتلات الحساسة\n"
    else:
        text += "✅ الطقس في نطاق التقويم الطبيعي\n"

    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /crop — التوصيات الزراعية
# ──────────────────────────────────────────────
async def crop(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    offset = get_user_offset(context)
    location = get_user_location_label(context)
    zone_id = context.user_data.get("zone_id", "highlands")
    nawaa = get_adjusted_nawaa(offset)

    if not nawaa:
        await update.message.reply_text("⚠️ لم يتم العثور على بيانات للنجم الحالي.")
        return

    planting = nawaa["planting"]
    activities = nawaa["activities"]
    warnings = nawaa["warnings"]

    # إضافة المحاصيل الاستوائية للغرب
    if zone_id == "west":
        for c in ["المانجو", "البابايا"]:
            if c not in planting:
                planting.append(c)

    def fmt_list(items: list, bullet: str = "•") -> str:
        return "\n".join(f"{bullet} {i}" for i in items) if items else "لا توجد توصيات"

    text = (
        f"🌱 *التوصيات الزراعية*\n"
        f"📍 {location} | نجم {nawaa['name']}\n"
        f"{'─' * 30}\n\n"
        f"🌾 *المحاصيل المناسبة:*\n{fmt_list(planting, '🟢')}\n\n"
        f"🔨 *الأنشطة الميدانية:*\n{fmt_list(activities, '🔵')}\n\n"
        f"⚠️ *تنبيهات ومخاطر:*\n{fmt_list(warnings, '🔴')}\n"
    )

    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /calendar — أنجم الشهر الحالي
# ──────────────────────────────────────────────
async def calendar_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    from nawaa_data import CALENDAR_2026
    today_date = datetime.today()
    current_month = today_date.month
    month_names = {
        1:'يناير', 2:'فبراير', 3:'مارس', 4:'أبريل', 5:'مايو', 6:'يونيو',
        7:'يوليو', 8:'أغسطس', 9:'سبتمبر', 10:'أكتوبر', 11:'نوفمبر', 12:'ديسمبر'
    }

    month_nawaa = []
    for n in CALENDAR_2026:
        sm = int(n['start'].split('-')[0])
        em = int(n['end'].split('-')[0])
        if sm == current_month or em == current_month:
            month_nawaa.append(n)

    if not month_nawaa:
        await update.message.reply_text("لا توجد بيانات للشهر الحالي.")
        return

    lines = [f"📅 *أنجم شهر {month_names[current_month]}*\n{'─'*28}\n"]
    today_str = today_date.strftime('%m-%d')

    for n in month_nawaa:
        is_current = n['start'] <= today_str <= n['end']
        marker = "◀️ *الحالي*" if is_current else ""
        sd, ed = n['start'].split('-')[1], n['end'].split('-')[1]
        temp = NAWAA_TEMPERATURE.get(n['id'], {})
        lines.append(
            f"{'⭐' if is_current else '•'} *{n['name']}* (دورة {n['cycle']}) {marker}\n"
            f"  📅 {sd} ← {ed} {month_names[current_month]}\n"
            f"  🌡 {temp.get('label', '—')}\n"
        )

    await update.message.reply_text("\n".join(lines), parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /help
# ──────────────────────────────────────────────
async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """إحصائيات المستخدمين — للأدمن فقط"""
    admin_id = int(os.getenv("ADMIN_CHAT_ID", "0"))
    if update.effective_user.id != admin_id:
        await update.message.reply_text("⛔ هذا الأمر للمشرف فقط.")
        return

    users = load_users()
    total = len(users)
    if total == 0:
        await update.message.reply_text("لا يوجد مستخدمون حتى الآن.")
        return

    # آخر 5 مستخدمين
    sorted_users = sorted(users.values(), key=lambda u: u["last_seen"], reverse=True)
    recent = "\n".join(
        f"• {u['name']} (@{u['username'] or '—'}) — {u['last_seen'][:10]}"
        for u in sorted_users[:5]
    )

    text = (
        f"📊 *إحصائيات البوت*\n"
        f"{'─' * 28}\n\n"
        f"👥 إجمالي المستخدمين: *{total}*\n\n"
        f"🕐 *آخر 5 مستخدمين:*\n{recent}"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "ℹ️ *التقويم الزراعي المطور — ابن عميرة*\n\n"
        "نظام زراعي ذكي مبني على تقويم ابن عميرة التراثي، معدَّل آلياً لكل مناطق المملكة مع بيانات الطقس الحي.\n\n"
        "📋 *الأوامر الأساسية:*\n"
        "/start — 🌿 البداية واختيار المنطقة\n"
        "/today — 🗓 النجم الحالي والمناخ المتوقع\n"
        "/weather — 🌡 الطقس الحي ومقارنته بالتقويم\n"
        "/crop — 🌱 المحاصيل والأنشطة الموصى بها\n"
        "/calendar — 📅 أنجم الشهر الحالي\n"
        "/setlocation — 📍 تغيير المدينة أو المنطقة\n\n"
        "⭐ *ميزات ذكية (جديد):*\n"
        "/score — 🌾 مؤشر ملاءمة الزراعة اليوم (0-100)\n"
        "/bestdays — 📅 أفضل أيام الزراعة في النجم الحالي\n"
        "/compare — 📊 مقارنة ابن عميرة vs الطقس الفعلي\n"
        "/ask [سؤالك] — 🤖 استشارة زراعية ذكية\n\n"
        "🔔 *التنبيهات:*\n"
        "/subscribe — تفعيل: صباحي يومي + تنبيه دخول نجم جديد\n"
        "/unsubscribe — إيقاف جميع التنبيهات\n\n"
        "*مصدر البيانات:*\n"
        "• التقويم: تقويم ابن عميرة للأنواء (30 نجماً)\n"
        "• الطقس: Open-Meteo (مجاني، محدّث كل ساعة)\n"
        "• المناطق: 5 مناطق مناخية، 60+ مدينة\n\n"
        "👨‍💻 *المطور:* @jadrawy\n"
        "🌐 *الموقع:* https://ibn-umaira.web.app"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# تنبيهات دورية (Job Queue)
# ──────────────────────────────────────────────
async def morning_alert(context: ContextTypes.DEFAULT_TYPE) -> None:
    """تنبيه صباحي يومي الساعة 6 صباحاً — مع مؤشر الملاءمة وأفضل أيام الزراعة"""
    chat_id = context.job.data if context.job.data else None
    if not chat_id:
        return

    # استرداد بيانات المستخدم
    users = load_users()
    user_data = users.get(str(chat_id), {})
    offset = user_data.get("offset", 0)
    zone_id = user_data.get("zone_id", "highlands")
    location = user_data.get("city") or user_data.get("zone_name", "المرتفعات الجبلية")

    nawaa = get_adjusted_nawaa(offset)
    if not nawaa:
        return

    score = get_farming_score(nawaa['name'], zone_id)
    s_label = score_label(score)
    filled = round(score / 10)
    bar = "🟩" * filled + "⬜" * (10 - filled)

    # تحقق إذا كان اليوم الأول في النجم
    new_nawaa_badge = ""
    if nawaa['day_in_nawaa'] == 1:
        new_nawaa_badge = "🌟 *نجم جديد دخل اليوم!*\n\n"

    text = (
        f"🌅 *صباح الخير من تقويم ابن عميرة!*\n"
        f"📍 {location}\n"
        f"{'─' * 28}\n\n"
        f"{new_nawaa_badge}"
        f"✨ *نجم {nawaa['name']}* — دورة {nawaa['cycle']}\n"
        f"📅 اليوم {nawaa['day_in_nawaa']} من {nawaa['duration']} | متبقي {nawaa['days_remaining']} يوم\n\n"
        f"🌡 الحرارة: {nawaa['temp_label']}\n"
        f"💨 الرياح: {nawaa['wind']}\n"
        f"🌧 الأمطار: {nawaa['rain']}\n\n"
        f"🌾 *مؤشر الملاءمة الزراعية:*\n"
        f"{bar} {score}/100\n"
        f"{s_label}\n\n"
        f"⭐ *أفضل وقت للزراعة:*\n{nawaa['best_days']}\n\n"
        f"📝 _{nawaa['note']}_\n\n"
        f"🔹 /today التفاصيل الكاملة\n"
        f"🔹 /crop التوصيات الزراعية\n"
        f"🔹 /score مؤشر الملاءمة التفصيلي"
    )
    await context.bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# تنبيه دخول نجم جديد (يُرسل للمشتركين عند دخول نجم جديد)
# ──────────────────────────────────────────────
async def new_nawaa_alert(context: ContextTypes.DEFAULT_TYPE) -> None:
    """يتحقق يومياً إذا دخل نجم جديد اليوم ويرسل تنبيهاً"""
    from datetime import date
    today_str = date.today().strftime('%m-%d')
    new_nawaa = None
    for n in CALENDAR_2026:
        if n['start'] == today_str:
            new_nawaa = n
            break
    if not new_nawaa:
        return

    users = load_users()
    for uid_str, udata in users.items():
        if not udata.get("subscribed"):
            continue
        try:
            nawaa_data = get_adjusted_nawaa(udata.get("offset", 0))
            if not nawaa_data:
                continue
            zone_name = udata.get("zone_name", "المرتفعات الجبلية")
            zone_id = udata.get("zone_id", "highlands")
            score = get_farming_score(new_nawaa['name'], zone_id)
            s_label = score_label(score)
            text = (
                f"🌟 *دخل نجم جديد!*\n\n"
                f"✨ *نجم {new_nawaa['name']}* — دورة {new_nawaa['cycle']}\n"
                f"📍 {zone_name}\n"
                f"{'─' * 28}\n\n"
                f"🌡 الحرارة المتوقعة: {nawaa_data['temp_label']}\n"
                f"💨 الرياح: {nawaa_data['wind']}\n"
                f"🌧 فرصة الأمطار: {nawaa_data['rain']}\n\n"
                f"🌾 *مؤشر الملاءمة الزراعية:* {s_label} ({score}/100)\n"
                f"⭐ *أفضل أيام للزراعة:* {nawaa_data['best_days']}\n\n"
                f"📝 _{new_nawaa['note']}_\n\n"
                f"اكتب /crop للتوصيات التفصيلية 🌿"
            )
            await context.bot.send_message(chat_id=int(uid_str), text=text, parse_mode=ParseMode.MARKDOWN)
        except Exception as e:
            logger.error(f"Failed to send new nawaa alert to {uid_str}: {e}")


# ──────────────────────────────────────────────
# /score — مؤشر ملاءمة الزراعة اليوم
# ──────────────────────────────────────────────
async def farming_score_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """يعرض مؤشر ملاءمة الزراعة اليوم مع شرح تفصيلي"""
    offset = get_user_offset(context)
    location = get_user_location_label(context)
    zone_id = context.user_data.get("zone_id", "highlands")
    nawaa = get_adjusted_nawaa(offset)

    if not nawaa:
        await update.message.reply_text("⚠️ لم يتم العثور على بيانات للنجم الحالي.")
        return

    score = get_farming_score(nawaa['name'], zone_id)
    s_label = score_label(score)

    # شريط مرئي للمؤشر
    filled = round(score / 10)
    bar = "🟩" * filled + "⬜" * (10 - filled)

    text = (
        f"🌾 *مؤشر ملاءمة الزراعة اليوم*\n"
        f"📍 {location} | نجم {nawaa['name']}\n"
        f"{'─' * 30}\n\n"
        f"{bar}\n"
        f"*{score}/100 — {s_label}*\n\n"
        f"⭐ *أفضل أيام للزراعة:*\n{nawaa['best_days']}\n\n"
        f"🌱 *أنسب المحاصيل لهذا الموسم:*\n{nawaa['best_crops_season']}\n\n"
        f"🪱 *نصيحة التربة:*\n_{nawaa['soil_advice']}_\n\n"
        f"💡 _المؤشر يأخذ بعين الاعتبار منطقتك المناخية والنجم الحالي_"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /bestdays — أفضل أيام الزراعة في النجم الحالي
# ──────────────────────────────────────────────
async def bestdays_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    offset = get_user_offset(context)
    location = get_user_location_label(context)
    nawaa = get_adjusted_nawaa(offset)

    if not nawaa:
        await update.message.reply_text("⚠️ لا توجد بيانات للنجم الحالي.")
        return

    zone_id = context.user_data.get("zone_id", "highlands")
    score = get_farming_score(nawaa['name'], zone_id)
    s_label = score_label(score)

    text = (
        f"📅 *أفضل أيام الزراعة*\n"
        f"📍 {location} | نجم {nawaa['name']} (دورة {nawaa['cycle']})\n"
        f"{'─' * 30}\n\n"
        f"⏱ *المدة الكاملة:* {nawaa['start_date']} ← {nawaa['end_date']} ({nawaa['duration']} يوم)\n"
        f"📌 *اليوم الحالي:* {nawaa['day_in_nawaa']} | متبقي {nawaa['days_remaining']} يوم\n\n"
        f"🌟 *الفترة الذهبية للزراعة:*\n"
        f"┗ {nawaa['best_days']}\n\n"
        f"🌾 *مؤشر الملاءمة:* {s_label} ({score}/100)\n\n"
        f"🪱 *نصيحة التربة:*\n_{nawaa['soil_advice']}_\n\n"
        f"🌱 *الموسم المناسب:*\n{nawaa['best_crops_season']}"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /ask — استشارة زراعية ذكية
# ──────────────────────────────────────────────
async def ask_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """استشارة زراعية مبنية على بيانات النجم الحالي"""
    args = context.args
    if not args:
        await update.message.reply_text(
            "🤖 *الاستشارة الزراعية الذكية*\n\n"
            "أرسل سؤالك بعد الأمر مباشرة، مثلاً:\n"
            "`/ask متى أزرع الطماطم؟`\n"
            "`/ask هل يناسب نجم السماك زراعة البطيخ؟`\n"
            "`/ask كيف أحمي نخيلي من الحرارة؟`",
            parse_mode=ParseMode.MARKDOWN
        )
        return

    question = " ".join(args)
    offset = get_user_offset(context)
    location = get_user_location_label(context)
    zone_id = context.user_data.get("zone_id", "highlands")
    nawaa = get_adjusted_nawaa(offset)

    if not nawaa:
        await update.message.reply_text("⚠️ تعذّر جلب بيانات النجم الحالي.")
        return

    score = get_farming_score(nawaa['name'], zone_id)

    # بناء الرد الذكي بناءً على البيانات المتاحة
    q_lower = question.lower()

    # تحليل السؤال وبناء رد ذكي
    if any(w in q_lower for w in ['طماطم', 'بندورة']):
        crop_info = "الطماطم تناسب درجات 15-30°م. " + (
            "✅ النجم الحالي مناسب لزراعتها." if nawaa['temp_avg'] <= 28
            else "⚠️ الحرارة مرتفعة — استخدم محميات مظللة."
        )
    elif any(w in q_lower for w in ['نخيل', 'تمر']):
        crop_info = "النخيل يحتاج حرارة 25-45°م ورطوبة منخفضة. " + (
            "✅ الجو مناسب لتلقيح النخيل." if 20 <= nawaa['temp_avg'] <= 40
            else "⚠️ راقب درجات الحرارة المتطرفة."
        )
    elif any(w in q_lower for w in ['ري', 'ماء', 'مياه']):
        crop_info = f"بناءً على نجم {nawaa['name']}: " + (
            "ري غزير مرتين يومياً بسبب الحرارة." if nawaa['temp_avg'] > 30
            else "ري معتدل صباحاً كافٍ في هذا الموسم."
        )
    elif any(w in q_lower for w in ['حشرات', 'آفات', 'مبيدات']):
        crop_info = f"في دورة {nawaa['cycle']}: " + (
            "نشاط الحشرات مرتفع — رش وقائي أسبوعي." if nawaa['temp_avg'] > 20
            else "الحشرات خاملة في البرد — مناسب لرش الزيوت الشتوية."
        )
    else:
        crop_info = f"بناءً على بيانات نجم {nawaa['name']} الحالي."

    planting_str = "، ".join(nawaa['planting'][:3]) if nawaa['planting'] else "لا توجد"
    warnings_str = "، ".join(nawaa['warnings'][:2]) if nawaa['warnings'] else "لا توجد"

    text = (
        f"🤖 *الاستشارة الزراعية الذكية*\n"
        f"📍 {location} | نجم {nawaa['name']}\n"
        f"{'─' * 30}\n\n"
        f"❓ *سؤالك:* {question}\n\n"
        f"💡 *الإجابة:*\n{crop_info}\n\n"
        f"📊 *وضع النجم الحالي:*\n"
        f"• الحرارة: {nawaa['temp_label']}\n"
        f"• مؤشر الملاءمة: {score}/100\n"
        f"• أفضل المحاصيل: {planting_str}\n"
        f"• تنبيهات: {warnings_str}\n\n"
        f"⭐ *أفضل أيام للزراعة:* {nawaa['best_days']}\n\n"
        f"_للاستشارة المتعمقة بالذكاء الاصطناعي، زر: https://ibn-umaira.web.app/ask_"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# /compare — مقارنة التقويم مع الطقس الفعلي
# ──────────────────────────────────────────────
async def compare_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """مقارنة تفصيلية: ابن عميرة vs الطقس الفعلي"""
    city = context.user_data.get("city")
    if not city:
        await update.message.reply_text("📍 حدد مدينتك أولاً عبر /setlocation للحصول على مقارنة دقيقة.")
        return

    coords = CITIES_COORDINATES.get(city)
    if not coords:
        await update.message.reply_text("❌ لا توجد إحداثيات لهذه المدينة.")
        return

    await update.message.reply_text(f"⏳ جاري جلب الطقس الحي لـ *{city}*...", parse_mode=ParseMode.MARKDOWN)

    lat, lon = coords
    live = await fetch_live_weather(lat, lon)
    offset = get_user_offset(context)
    nawaa = get_adjusted_nawaa(offset)

    if not live or not nawaa:
        await update.message.reply_text("⚠️ تعذّر جلب البيانات. حاول مجدداً.")
        return

    score = calc_match_score(live["temp"], nawaa["temp_avg"])
    diff = live["temp"] - nawaa["temp_avg"]
    trend = (
        f"⬆️ أعلى بـ +{abs(round(diff))}°م من المعتاد"
        if diff > 2 else
        f"⬇️ أقل بـ {abs(round(diff))}°م من المعتاد"
        if diff < -2 else
        "↔️ متوافق مع التقويم الكلاسيكي"
    )

    zone_id = context.user_data.get("zone_id", "highlands")
    farm_score = get_farming_score(nawaa['name'], zone_id)

    text = (
        f"📊 *ابن عميرة vs الطقس الحي*\n"
        f"📍 {city} | نجم {nawaa['name']}\n"
        f"{'─' * 30}\n\n"
        f"*تقويم ابن عميرة (التاريخي):*\n"
        f"🌡 الحرارة المتوقعة: {nawaa['temp_avg']}°م\n"
        f"💨 الرياح المتوقعة: {nawaa['wind']}\n"
        f"🌧 فرصة الأمطار: {nawaa['rain']}\n\n"
        f"*الطقس الفعلي (مباشر):*\n"
        f"🌡 الحرارة الحية: {live['temp']}°م\n"
        f"💨 سرعة الرياح: {live['wind']} كم/س\n"
        f"🌤 الحالة: {wmo_to_arabic(live['wmo'])}\n\n"
        f"*نتيجة المقارنة:*\n"
        f"{trend}\n"
        f"🎯 نسبة توافق التقويم: {score_emoji(score)} {score}%\n\n"
        f"🌾 *مؤشر ملاءمة الزراعة:* {score_label(farm_score)}\n"
        f"⭐ *أفضل أيام:* {nawaa['best_days']}"
    )

    # تنبيهات ذكية بناءً على الفارق
    extra = ""
    if diff > 7:
        extra = "\n\n🔴 *تنبيه حرج:* الحرارة أعلى بكثير من المعتاد — كثّف الري وتجنب الزراعة نهاراً"
    elif diff > 4:
        extra = "\n\n🟡 *تنبيه:* حرارة أعلى من المتوقع — ري مسائي إضافي"
    elif diff < -7:
        extra = "\n\n🔴 *تنبيه حرج:* برد شديد غير متوقع — احمِ الشتلات الحساسة فوراً"
    elif diff < -4:
        extra = "\n\n🟡 *تنبيه:* برد أكثر من المعتاد — قلّل الري وغطِّ الشتلات ليلاً"

    await update.message.reply_text(text + extra, parse_mode=ParseMode.MARKDOWN)


async def subscribe_alerts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """اشترك في التنبيهات الصباحية اليومية + تنبيه دخول النجم"""
    chat_id = update.effective_chat.id
    user = update.effective_user

    # إلغاء الجدولة القديمة إن وجدت
    for job_name in [f"morning_{chat_id}", f"nawaa_check_{chat_id}"]:
        for job in context.job_queue.get_jobs_by_name(job_name):
            job.schedule_removal()

    # حفظ بيانات الاشتراك في ملف المستخدمين
    users = load_users()
    uid = str(chat_id)
    if uid not in users:
        users[uid] = {"name": user.full_name, "username": user.username or ""}
    users[uid]["subscribed"] = True
    users[uid]["offset"] = get_user_offset(context)
    users[uid]["zone_id"] = context.user_data.get("zone_id", "highlands")
    users[uid]["zone_name"] = get_user_location_label(context)
    users[uid]["city"] = context.user_data.get("city", "")
    USERS_FILE.parent.mkdir(exist_ok=True)
    USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2))

    # تنبيه صباحي يومي الساعة 6
    context.job_queue.run_daily(
        morning_alert,
        time=time(hour=6, minute=0),
        chat_id=chat_id,
        name=f"morning_{chat_id}",
        data=chat_id
    )
    # تحقق يومي من دخول نجم جديد الساعة 00:05
    context.job_queue.run_daily(
        new_nawaa_alert,
        time=time(hour=0, minute=5),
        name=f"nawaa_check_{chat_id}",
        data=chat_id
    )

    location = get_user_location_label(context)
    await update.message.reply_text(
        f"✅ *تم تفعيل التنبيهات الذكية!*\n"
        f"📍 المنطقة: {location}\n\n"
        f"ستصلك يومياً:\n"
        f"🌅 *الساعة 6 صباحاً:* ملخص النجم الحالي + مؤشر الملاءمة\n"
        f"🌟 *عند دخول نجم جديد:* تنبيه فوري مع التوصيات\n\n"
        f"لإلغاء التنبيهات: /unsubscribe",
        parse_mode=ParseMode.MARKDOWN
    )


async def unsubscribe_alerts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """إلغاء الاشتراك في جميع التنبيهات"""
    chat_id = update.effective_chat.id
    found = False
    for job_name in [f"morning_{chat_id}", f"nawaa_check_{chat_id}"]:
        jobs = context.job_queue.get_jobs_by_name(job_name)
        for job in jobs:
            job.schedule_removal()
            found = True

    # تحديث ملف المستخدمين
    users = load_users()
    if str(chat_id) in users:
        users[str(chat_id)]["subscribed"] = False
        USERS_FILE.write_text(json.dumps(users, ensure_ascii=False, indent=2))

    if found:
        await update.message.reply_text(
            "✅ تم إلغاء جميع التنبيهات (الصباحية + دخول النجوم).\n"
            "يمكنك إعادة التفعيل في أي وقت عبر /subscribe"
        )
    else:
        await update.message.reply_text("لم تكن مشتركاً في أي تنبيهات.")


# ──────────────────────────────────────────────
# تشغيل البوت
# ──────────────────────────────────────────────
def main() -> None:
    if not TOKEN:
        print("❌ خطأ: متغير TELEGRAM_BOT_TOKEN غير محدد!")
        print("   قم بتشغيل: export TELEGRAM_BOT_TOKEN='your_token_here'")
        return

    app = Application.builder().token(TOKEN).build()

    # أوامر
    app.add_handler(CommandHandler("start",       start))
    app.add_handler(CommandHandler("help",        help_cmd))
    app.add_handler(CommandHandler("today",       today))
    app.add_handler(CommandHandler("weather",     weather))
    app.add_handler(CommandHandler("crop",        crop))
    app.add_handler(CommandHandler("calendar",    calendar_cmd))
    app.add_handler(CommandHandler("setlocation", setlocation))
    app.add_handler(CommandHandler("subscribe",   subscribe_alerts))
    app.add_handler(CommandHandler("unsubscribe", unsubscribe_alerts))
    app.add_handler(CommandHandler("stats",       stats))
    # أوامر جديدة
    app.add_handler(CommandHandler("score",       farming_score_cmd))
    app.add_handler(CommandHandler("bestdays",    bestdays_cmd))
    app.add_handler(CommandHandler("ask",         ask_cmd))
    app.add_handler(CommandHandler("compare",     compare_cmd))

    # أزرار inline
    app.add_handler(CallbackQueryHandler(button_handler))

    # قائمة الأوامر في تلقرام
    commands = [
        BotCommand("start",       "البداية واختيار المنطقة"),
        BotCommand("today",       "النجم الحالي وتوصيات اليوم"),
        BotCommand("score",       "مؤشر ملاءمة الزراعة اليوم 0-100"),
        BotCommand("bestdays",    "أفضل أيام الزراعة في النجم الحالي"),
        BotCommand("ask",         "استشارة زراعية ذكية"),
        BotCommand("compare",     "مقارنة التقويم مع الطقس الفعلي"),
        BotCommand("weather",     "الطقس الحي ومقارنته بالتقويم"),
        BotCommand("crop",        "المحاصيل والانشطة الموصى بها"),
        BotCommand("calendar",    "انجم الشهر الحالي"),
        BotCommand("setlocation", "تغيير المدينة او المنطقة"),
        BotCommand("subscribe",   "تفعيل التنبيهات الذكية"),
        BotCommand("unsubscribe", "ايقاف جميع التنبيهات"),
        BotCommand("help",        "قائمة الاوامر والمساعدة"),
    ]

    async def post_init(app: Application) -> None:
        await app.bot.set_my_commands(commands)
        info = await app.bot.get_me()
        print(f"✅ البوت يعمل: @{info.username}")

    app.post_init = post_init

    print("🌿 بوت تقويم ابن عميرة الزراعي — جاري التشغيل...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
