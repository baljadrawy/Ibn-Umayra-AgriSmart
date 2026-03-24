
"use client";

import { useState, useEffect } from 'react';
import NawaaCard from '@/components/dashboard/NawaaCard';
import WeatherCompare from '@/components/dashboard/WeatherCompare';
import RecommendationList from '@/components/dashboard/RecommendationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight, AlertCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// التقويم الكامل المستخرج من الصورة لعام 2026
const CALENDAR_2026 = [
  { id: 1, name: "الذراع", cycle: "الأسدية", start: "2026-01-02", end: "2026-01-12", hijriStart: "13 رجب", hijriEnd: "23 رجب", note: "موعد البرد القارس، الرياح غربية وقد تتحول لشرقية سريعة باردة." },
  { id: 2, name: "النثرة", cycle: "الأسدية", start: "2026-01-13", end: "2026-01-25", hijriStart: "24 رجب", hijriEnd: "06 شعبان", note: "درجة الحرارة تصل لأقل مستوى لها طوال العام، رياح شرقية رطبة باردة." },
  { id: 3, name: "الطرف", cycle: "الأسدية", start: "2026-01-26", end: "2026-02-05", hijriStart: "07 شعبان", hijriEnd: "17 شعبان", note: "درجة الحرارة تميل للاعتدال ليلاً، رياح غربية شديدة البرودة وسريعة." },
  { id: 4, name: "الجبهة", cycle: "الدبور", start: "2026-02-06", end: "2026-02-19", hijriStart: "18 شعبان", hijriEnd: "02 رمضان", note: "تحسن في درجات الحرارة مع بعض التقلبات، الرياح غالباً غربية إلى جنوبية غربية." },
  { id: 5, name: "الزبرة", cycle: "الدبور", start: "2026-02-20", end: "2026-03-04", hijriStart: "03 رمضان", hijriEnd: "15 رمضان", note: "الجو متقلب من اعتدال إلى برد قارس، الرياح غربية نشطة منذ الظهر." },
  { id: 6, name: "العطف", cycle: "الدبور", start: "2026-03-05", end: "2026-03-16", hijriStart: "16 رمضان", hijriEnd: "27 رمضان", note: "الجو يميل للاعتدال مع برودة ليلاً، رياح غالباً غربية إلى جنوبية غربية." },
  { id: 7, name: "السماك", cycle: "الكنة", start: "2026-03-17", end: "2026-03-28", hijriStart: "28 رمضان", hijriEnd: "10 شوال", note: "الجو معتدل، موسم نزول الأمطار إذا لم تهب الرياح الغربية السريعة، أفضل أوقات الإزهار." },
  { id: 8, name: "السميك", cycle: "الكنة", start: "2026-03-29", end: "2026-04-09", hijriStart: "11 شوال", hijriEnd: "22 شوال", note: "الجو معتدل جميل جداً إذا لم تهب الرياح الغربية الشديدة." },
  { id: 9, name: "العقرب", cycle: "الكنة", start: "2026-04-10", end: "2026-04-21", hijriStart: "23 شوال", hijriEnd: "04 ذو القعدة", note: "الجو معتدل وقد يتخلله برد قارس، الرياح هادئة متقلبة من شرقية إلى غربية." },
  { id: 10, name: "العقيرب", cycle: "الكنة", start: "2026-04-22", end: "2026-05-03", hijriStart: "05 ذو القعدة", hijriEnd: "16 ذو القعدة", note: "الجو معتدل يميل للدفء، الرياح متقلبة من شرقية إلى غربية." },
  { id: 11, name: "الكف", cycle: "الكنة", start: "2026-05-04", end: "2026-05-15", hijriStart: "17 ذو القعدة", hijriEnd: "28 ذو القعدة", note: "الجو دافئ يميل للحرارة الملحوظة، الرياح غالباً شرقية إلى جنوبية غربية هادئة." },
  { id: 12, name: "الثريا", cycle: "الغفر", start: "2026-05-16", end: "2026-05-27", hijriStart: "29 ذو القعدة", hijriEnd: "11 ذو الحجة", note: "الجو دافئ يميل للحرارة كثيراً، الرياح غالباً من شرقية إلى غربية." },
  { id: 13, name: "المجيدح", cycle: "الغفر", start: "2026-05-28", end: "2026-06-08", hijriStart: "12 ذو الحجة", hijriEnd: "22 ذو الحجة", note: "الجو شديد الحرارة، الأمطار نادرة إلى حد ما." },
  { id: 14, name: "الجوزاء", cycle: "الغفر", start: "2026-06-09", end: "2026-06-20", hijriStart: "23 ذو الحجة", hijriEnd: "05 محرم", note: "الجو حار شديد وجاف، الأمطار نادرة وموضعية." },
  { id: 15, name: "المرزم", cycle: "الغفر", start: "2026-06-21", end: "2026-07-02", hijriStart: "06 محرم", hijriEnd: "17 محرم", note: "الجو شديد الحرارة والسموم، الرياح غالباً غربية." },
  { id: 16, name: "الذراع", cycle: "الخضر", start: "2026-07-03", end: "2026-07-14", hijriStart: "18 محرم", hijriEnd: "29 محرم", note: "الجو شديد الحرارة، الرياح غالباً غربية، بداية نزول فواكه الطائف." },
  { id: 17, name: "النثرة", cycle: "الخضر", start: "2026-07-15", end: "2026-07-26", hijriStart: "01 صفر", hijriEnd: "12 صفر", note: "الجو صحو شديد الحرارة جاف، الرياح غالباً شرقية إلى شمالية." },
  { id: 18, name: "الطرف", cycle: "الخضر", start: "2026-08-07", end: "2026-08-07", hijriStart: "13 صفر", hijriEnd: "24 صفر", note: "درجة الحرارة تبدأ في الانخفاض، الرياح غربية غربية شبه مستمرة." },
  { id: 19, name: "الجبهة", cycle: "الخضر", start: "2026-08-08", end: "2026-08-21", hijriStart: "25 صفر", hijriEnd: "08 ربيع أول", note: "الجو أقل حرارة من سابقه، بعض الأمطار الموضعية." },
  { id: 20, name: "الزبرة", cycle: "الخضر", start: "2026-08-22", end: "2026-09-02", hijriStart: "09 ربيع أول", hijriEnd: "20 ربيع أول", note: "الجو صاف يميل إلى الصفاء، الرياح غربية إلى جنوبية غربية." },
  { id: 21, name: "العطف", cycle: "الخضر", start: "2026-09-03", end: "2026-09-14", hijriStart: "21 ربيع أول", hijriEnd: "03 ربيع ثاني", note: "الجو يميل للاعتدال ولكنه غير لطيف، رياح جنوبية تميل للجفاف." },
  { id: 22, name: "السماك", cycle: "الأنث", start: "2026-09-15", end: "2026-09-26", hijriStart: "04 ربيع ثاني", hijriEnd: "15 ربيع ثاني", note: "الجو معتدل جاف ومتميز عن سابقه، الرياح شرقية صباحاً." },
  { id: 23, name: "السميك", cycle: "الأنث", start: "2026-09-27", end: "2026-10-08", hijriStart: "16 ربيع ثاني", hijriEnd: "27 ربيع ثاني", note: "الجو معتدل جاف يميل للبرد ليلاً، الرياح شرقية إلى جنوبية." },
  { id: 24, name: "العقرب", cycle: "الأنث", start: "2026-10-09", end: "2026-10-20", hijriStart: "28 ربيع ثاني", hijriEnd: "09 جمادى أول", note: "الجو جاف معتدل الحرارة، الرياح غربية نشطة." },
  { id: 25, name: "العقيرب", cycle: "الأنث", start: "2026-10-21", end: "2026-11-01", hijriStart: "10 جمادى أول", hijriEnd: "21 جمادى أول", note: "الجو بارد يميل للبرودة، رياح شمالية غربية مثيرة للأتربة." },
  { id: 26, name: "الكف", cycle: "الأنث", start: "2026-11-02", end: "2026-11-13", hijriStart: "22 جمادى أول", hijriEnd: "03 جمادى ثاني", note: "الجو معتدل أقل جفافاً من سابقه، الرياح شمالية غربية." },
  { id: 27, name: "الثريا", cycle: "الأنث", start: "2026-11-14", end: "2026-11-25", hijriStart: "04 جمادى ثاني", hijriEnd: "15 جمادى ثاني", note: "الجو معتدل يميل للبرودة ليلاً، رياح غربية هادئة." },
  { id: 28, name: "المجيدح", cycle: "الأنث", start: "2026-11-26", end: "2026-12-07", hijriStart: "16 جمادى ثاني", hijriEnd: "27 جمادى ثاني", note: "الجو يميل للبرودة كثيراً، رياح غربية إلى جنوبية." },
  { id: 29, name: "الجوزاء", cycle: "الأنث", start: "2026-12-08", end: "2026-12-19", hijriStart: "28 جمادى ثاني", hijriEnd: "10 رجب", note: "الجو بارد، الرياح غالباً غربية باردة رطبة." },
  { id: 30, name: "المرزم", cycle: "الأنث", start: "2026-12-20", end: "2026-12-31", hijriStart: "11 رجب", hijriEnd: "22 رجب", note: "الجو أكثر برودة، الرياح غالباً غربية باردة ورطبة، أطول ليل وأقصر نهار." },
];

function getCurrentNawaaInfo() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const current = CALENDAR_2026.find(n => todayStr >= n.start && todayStr <= n.end);

  if (current) {
    const start = new Date(current.start);
    const end = new Date(current.end);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const elapsed = Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const locale = 'ar-EG'; 

    return {
      name: current.name,
      season: current.cycle,
      day_in_nawaa: elapsed,
      days_remaining: duration - elapsed,
      progress_percent: Math.round((elapsed / duration) * 100),
      startDate: start.toLocaleDateString(locale, dateOptions),
      endDate: end.toLocaleDateString(locale, dateOptions),
      hijriStart: current.hijriStart,
      hijriEnd: current.hijriEnd,
      duration: duration,
      climate: {
        temperature: "21°م - معتدل",
        wind: "جنوبية شرقية",
        rain: "10% - غيوم عابرة",
        notes: current.note
      }
    };
  }

  return null;
}

export default function Home() {
  const [currentNawaa, setCurrentNawaa] = useState<any>(null);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  useEffect(() => {
    setCurrentNawaa(getCurrentNawaaInfo());
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* Beta Notice Bar */}
      <div className="bg-orange-50 border-b border-orange-100 py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-orange-700">
          <AlertCircle className="h-3 w-3" />
          <span>تنبيه: هذا الموقع في مرحلة الإطلاق التجريبي (Beta). البيانات مبدئية وتخضع للتحديث المستمر.</span>
        </div>
      </div>

      {/* Apple-style Minimal Hero */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="container mx-auto text-center space-y-6">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 w-fit mx-auto">
            <MapPin className="h-3 w-3" />
            توصيات مرجع الطائف
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold apple-text-gradient leading-[1.1] tracking-tight">
            التقويم الزراعي المطور <br className="hidden md:block" />
            <span className="text-primary/80">المبني على تقويم ابن عميرة</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            بوابة ذكية تدمج الخبرة التاريخية للمملكة مع أحدث تقنيات الرصد والذكاء الاصطناعي.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button size="lg" className="rounded-full px-8 bg-black hover:bg-black/90 text-white font-semibold" asChild>
              <Link href="/ask">استشر الذكاء الزراعي <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8 font-semibold group" asChild>
              <Link href="/calendar">استكشف التقويم الكامل <ChevronRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Image Box */}
      <section className="container mx-auto px-4 mb-24">
        <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
          <Image
            src={heroImage?.imageUrl || ""}
            alt="Saudi Farm"
            fill
            className="object-cover"
            priority
            data-ai-hint="saudi farm landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Bento Grid Dashboard */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-5 flex">
            {currentNawaa && <NawaaCard nawaa={currentNawaa} />}
          </div>
          <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex">
                <WeatherCompare expectedClimate={currentNawaa?.climate} />
             </div>
             <div className="flex">
                <RecommendationList recommendations={{
                  planting: ["البامية", "الكوسا", "الفلفل", "الباذنجان"],
                  activities: ["بدء ري الأشجار المتساقطة", "تسميد أحواض الخضار"],
                  warnings: ["مراقبة نشاط الحشرات الربيعية", "تجنب التعطيش المفاجئ"]
                }} />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
