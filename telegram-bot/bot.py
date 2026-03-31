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
    CLIMATE_ZONES, CITIES_COORDINATES, NAWAA_TEMPERATURE,
    get_adjusted_nawaa, get_zone_for_city, get_nearest_city
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
        "ℹ️ *التقويم الزراعي المطور*\n\n"
        "نظام زراعي ذكي مبني على تقويم ابن عميرة التراثي، معدَّل آلياً لكل مناطق المملكة مع بيانات الطقس الحي.\n\n"
        "*الأوامر المتاحة:*\n"
        "/start — 🌿 البداية واختيار المنطقة\n"
        "/today — 🗓 النجم الحالي والمناخ المتوقع\n"
        "/weather — 🌡 الطقس الحي ومقارنته بالتقويم\n"
        "/crop — 🌱 المحاصيل والأنشطة الموصى بها\n"
        "/calendar — 📅 أنجم الشهر الحالي\n"
        "/setlocation — 📍 تغيير المدينة أو المنطقة\n"
        "/subscribe — 🔔 تفعيل التنبيه الصباحي اليومي\n"
        "/unsubscribe — 🔕 إيقاف التنبيه الصباحي\n\n"
        "*مصدر البيانات:*\n"
        "• التقويم الزراعي: تقويم ابن عميرة للأنواء\n"
        "• بيانات الطقس: Open-Meteo (مجاني، محدّث كل ساعة)\n"
        "• المناطق المدعومة: 5 مناطق مناخية، 60+ مدينة سعودية\n\n"
        "👨‍💻 *المطور:* @jadrawy\n"
    )
    await update.message.reply_text(text, parse_mode=ParseMode.MARKDOWN)


# ──────────────────────────────────────────────
# تنبيهات دورية (Job Queue)
# ──────────────────────────────────────────────
async def morning_alert(context: ContextTypes.DEFAULT_TYPE) -> None:
    """تنبيه صباحي يومي الساعة 6 صباحاً"""
    # في بيئة إنتاجية: احفظ chat_ids في قاعدة بيانات وأرسل لكل مشترك
    # هنا مثال أساسي
    chat_id = context.job.data if context.job.data else None
    if not chat_id:
        return

    nawaa = get_adjusted_nawaa(0)  # offset افتراضي
    if not nawaa:
        return

    text = (
        f"🌅 *صباح الخير!*\n\n"
        f"✨ *نجم {nawaa['name']}* — اليوم {nawaa['day_in_nawaa']}\n"
        f"🌡 الحرارة المتوقعة: {nawaa['temp_label']}\n"
        f"📝 _{nawaa['note']}_\n\n"
        f"اكتب /today للتفاصيل الكاملة 🌿"
    )
    await context.bot.send_message(chat_id=chat_id, text=text, parse_mode=ParseMode.MARKDOWN)


async def subscribe_alerts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """اشترك في التنبيهات الصباحية اليومية"""
    chat_id = update.effective_chat.id
    # إلغاء القديم إن وجد
    current = context.job_queue.get_jobs_by_name(f"morning_{chat_id}")
    for job in current:
        job.schedule_removal()

    context.job_queue.run_daily(
        morning_alert,
        time=time(hour=6, minute=0),
        chat_id=chat_id,
        name=f"morning_{chat_id}",
        data=chat_id
    )
    await update.message.reply_text(
        "✅ *تم التسجيل في التنبيهات الصباحية!*\n"
        "ستصلك رسالة كل يوم الساعة 6 صباحاً بملخص النجم الحالي 🌅",
        parse_mode=ParseMode.MARKDOWN
    )


async def unsubscribe_alerts(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """إلغاء الاشتراك"""
    chat_id = update.effective_chat.id
    jobs = context.job_queue.get_jobs_by_name(f"morning_{chat_id}")
    if jobs:
        for job in jobs:
            job.schedule_removal()
        await update.message.reply_text("✅ تم إلغاء اشتراكك في التنبيهات الصباحية.")
    else:
        await update.message.reply_text("لم تكن مشتركاً في التنبيهات.")


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
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("today", today))
    app.add_handler(CommandHandler("weather", weather))
    app.add_handler(CommandHandler("crop", crop))
    app.add_handler(CommandHandler("calendar", calendar_cmd))
    app.add_handler(CommandHandler("setlocation", setlocation))
    app.add_handler(CommandHandler("subscribe", subscribe_alerts))
    app.add_handler(CommandHandler("unsubscribe", unsubscribe_alerts))
    app.add_handler(CommandHandler("stats", stats))

    # أزرار inline
    app.add_handler(CallbackQueryHandler(button_handler))

    # قائمة الأوامر في تلقرام
    commands = [
        BotCommand("start",       "البداية واختيار المنطقة"),
        BotCommand("today",       "النجم الحالي وتوصيات اليوم"),
        BotCommand("weather",     "الطقس الحي ومقارنته بالتقويم"),
        BotCommand("crop",        "المحاصيل والانشطة الموصى بها"),
        BotCommand("calendar",    "انجم الشهر الحالي"),
        BotCommand("setlocation", "تغيير المدينة او المنطقة"),
        BotCommand("subscribe",   "تفعيل التنبيه الصباحي اليومي"),
        BotCommand("unsubscribe", "ايقاف التنبيه الصباحي"),
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
