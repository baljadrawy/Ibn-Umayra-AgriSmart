
"use client";

import { useState, useEffect } from 'react';
import NawaaCard from '@/components/dashboard/NawaaCard';
import WeatherCompare from '@/components/dashboard/WeatherCompare';
import RecommendationList from '@/components/dashboard/RecommendationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight, AlertCircle, Info, Navigation, LocateFixed, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLIMATE_ZONES_DATA } from '@/lib/location-data';

// التقويم السنوي الكامل 2026 المستخرج من صورة تقويم ابن عميرة
const CALENDAR_2026 = [
  { id: 1, name: "الذراع", cycle: "الأسدية", start: "2026-01-02", end: "2026-01-12", note: "موعد البرد القارس، الرياح غربية وقد تتحول لشرقية سريعة باردة." },
  { id: 2, name: "النثرة", cycle: "الأسدية", start: "2026-01-13", end: "2026-01-25", note: "درجة الحرارة تصل لأقل مستوى لها طوال العام، رياح شرقية رطبة باردة." },
  { id: 3, name: "الطرف", cycle: "الأسدية", start: "2026-01-26", end: "2026-02-05", note: "درجة الحرارة تميل للاعتدال ليلاً، رياح غربية شديدة البرودة وسريعة." },
  { id: 4, name: "الجبهة", cycle: "الدبور", start: "2026-02-06", end: "2026-02-19", note: "تحسن في درجات الحرارة مع بعض التقلبات، الرياح غالباً غربية إلى جنوبية غربية." },
  { id: 5, name: "الزبرة", cycle: "الدبور", start: "2026-02-20", end: "2026-03-04", note: "الجو متقلب من اعتدال إلى برد قارس، الرياح غربية نشطة منذ الظهر." },
  { id: 6, name: "العطف", cycle: "الدبور", start: "2026-03-05", end: "2026-03-16", note: "الجو يميل للاعتدال مع برودة ليلاً، رياح غالباً غربية إلى جنوبية غربية." },
  { id: 7, name: "السماك", cycle: "الكنة", start: "2026-03-17", end: "2026-03-28", note: "الجو معتدل، موسم نزول الأمطار إذا لم تهب الرياح الغربية السريعة، أفضل أوقات الإزهار." },
  { id: 8, name: "السميك", cycle: "الكنة", start: "2026-03-29", end: "2026-04-09", note: "الجو معتدل جميل جداً إذا لم تهب الرياح الغربية الشديدة." },
  { id: 9, name: "العقرب", cycle: "الكنة", start: "2026-04-10", end: "2026-04-21", note: "الجو معتدل وقد يتخلله برد قارس، الرياح هادئة متقلبة." },
  { id: 10, name: "العقيرب", cycle: "الكنة", start: "2026-04-22", end: "2026-05-03", note: "الجو معتدل يميل للدفء، الرياح متقلبة من شرقية إلى غربية." },
  { id: 11, name: "الكف", cycle: "الكنة", start: "2026-05-04", end: "2026-05-15", note: "الجو دافئ يميل للحرارة الملحوظة، الرياح غالباً شرقية إلى جنوبية غربية." },
  { id: 12, name: "الثريا", cycle: "الغفر", start: "2026-05-16", end: "2026-05-27", note: "الجو دافئ يميل للحرارة كثيراً، الرياح غالباً من شرقية إلى غربية." },
  { id: 13, name: "المجيدح", cycle: "الغفر", start: "2026-05-28", end: "2026-06-08", note: "الجو شديد الحرارة، الأمطار نادرة إلى حد ما." },
  { id: 14, name: "الجوزاء", cycle: "الغفر", start: "2026-06-09", end: "2026-06-20", note: "الجو حار شديد وجاف، الأمطار نادرة وموضعية." },
  { id: 15, name: "المرزم", cycle: "الغفر", start: "2026-06-21", end: "2026-07-02", note: "الجو شديد الحرارة والسموم، الرياح غالباً غربية." },
  { id: 16, name: "الذراع", cycle: "الخضر", start: "2026-07-03", end: "2026-07-14", note: "الجو شديد الحرارة، بداية نزول فواكه الطائف." },
  { id: 17, name: "النثرة", cycle: "الخضر", start: "2026-07-15", end: "2026-07-26", note: "الجو صحو شديد الحرارة جاف، الرياح غالباً شرقية." },
  { id: 18, name: "الطرف", cycle: "الخضر", start: "2026-08-07", end: "2026-08-07", note: "درجة الحرارة تبدأ في الانخفاض." },
  { id: 19, name: "الجبهة", cycle: "الخضر", start: "2026-08-08", end: "2026-08-21", note: "الجو أقل حرارة من سابقه." },
  { id: 20, name: "الزبرة", cycle: "الخضر", start: "2026-08-22", end: "2026-09-02", note: "الجو صاف يميل إلى الصفاء." },
  { id: 21, name: "العطف", cycle: "الخضر", start: "2026-09-03", end: "2026-09-14", note: "الجو يميل للاعتدال ولكنه غير لطيف." },
  { id: 22, name: "السماك", cycle: "الأنث", start: "2026-09-15", end: "2026-09-26", note: "الجو معتدل جاف متميز." },
  { id: 23, name: "السميك", cycle: "الأنث", start: "2026-09-27", end: "2026-10-08", note: "الجو معتدل جاف يميل للبرد ليلاً." },
  { id: 24, name: "العقرب", cycle: "الأنث", start: "2026-10-09", end: "2026-10-20", note: "الجو جاف معتدل الحرارة." },
  { id: 25, name: "العقيرب", cycle: "الأنث", start: "2026-10-21", end: "2026-11-01", note: "الجو بارد يميل للبرودة." },
  { id: 26, name: "الكف", cycle: "الأنث", start: "2026-11-02", end: "2026-11-13", note: "الجو معتدل أقل جفافاً." },
  { id: 27, name: "الثريا", cycle: "الأنث", start: "2026-11-14", end: "2026-11-25", note: "الجو معتدل يميل للبرودة ليلاً." },
  { id: 28, name: "المجيدح", cycle: "الأنث", start: "2026-11-26", end: "2026-12-07", note: "الجو يميل للبرودة كثيراً." },
  { id: 29, name: "الجوزاء", cycle: "الأنث", start: "2026-12-08", end: "2026-12-19", note: "الجو بارد." },
  { id: 30, name: "المرزم", cycle: "الأنث", start: "2026-12-20", end: "2026-12-31", note: "الجو أكثر برودة، أطول ليل وأقصر نهار." },
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
    
    const locale = 'ar-EG'; 
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

    return {
      name: current.name,
      season: current.cycle,
      day_in_nawaa: elapsed,
      days_remaining: duration - elapsed,
      progress_percent: Math.round((elapsed / duration) * 100),
      startDate: start.toLocaleDateString(locale, dateOptions),
      endDate: end.toLocaleDateString(locale, dateOptions),
      duration: duration,
      climate: {
        temperature: "21°م - معتدل",
        wind: "جنوبية شرقية",
        rain: "10%",
        notes: current.note
      }
    };
  }
  return null;
}

export default function Home() {
  const [currentNawaa, setCurrentNawaa] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCity, setOnboardingCity] = useState("");
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  useEffect(() => {
    setCurrentNawaa(getCurrentNawaaInfo());
    
    // فحص إذا كان المستخدم دخل لأول مرة
    const savedCity = localStorage.getItem('user_city');
    if (!savedCity) {
      setTimeout(() => setShowOnboarding(true), 1500);
    }
  }, []);

  const handleOnboardingManual = () => {
    if (onboardingCity) {
      localStorage.setItem('user_city', onboardingCity);
      setShowOnboarding(false);
      window.location.reload(); // إعادة التحميل لتطبيق الاختيار
    }
  };

  const handleOnboardingAuto = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        localStorage.setItem('user_city', 'auto');
        localStorage.setItem('user_lat', pos.coords.latitude.toString());
        localStorage.setItem('user_lon', pos.coords.longitude.toString());
        setShowOnboarding(false);
        window.location.reload();
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent/10 py-2 border-b border-accent/20">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-primary">
          <AlertCircle className="h-3 w-3" />
          <span>إطلاق تجريبي: التقويم الزراعي المطور - بيانات 2026 مهيكلة آلياً</span>
        </div>
      </div>

      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto text-center space-y-6">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 w-fit mx-auto">
            <Navigation className="h-3 w-3" />
            النظام يدعم التحديد الآلي واليدوي لكافة مناطق المملكة
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold apple-text-gradient leading-[1.1] tracking-tight">
            التقويم الزراعي المطور <br />
            <span className="text-primary">بناءً على تقويم ابن عميرة</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            بوابة ذكية تدمج الخبرة التاريخية للمملكة مع أحدث تقنيات الرصد والذكاء الاصطناعي.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg" asChild>
              <Link href="/ask">استشر الذكاء الزراعي <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8 font-semibold group" asChild>
              <Link href="/calendar">استكشف التقويم الكامل <ChevronRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="relative h-[250px] md:h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
          <Image
            src={heroImage?.imageUrl || ""}
            alt="Saudi Farm"
            fill
            className="object-cover"
            priority
            data-ai-hint="saudi farm landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 right-8 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-accent" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">تنبيه ذكي</p>
            </div>
            <p className="text-sm md:text-base font-medium max-w-md">اختر مدينتك من قائمة "مقارنة الطقس" ليقوم النظام بحساب التعديل الزمني المناسب لك.</p>
          </div>
        </div>
      </section>

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
                  activities: ["بدء ري الأشجار", "تسميد أحواض الخضار"],
                  warnings: ["مراقبة نشاط الحشرات", "تجنب التعطيش المفاجئ"]
                }} />
             </div>
          </div>
        </div>
      </section>

      {/* حوار الترحيب وتهيئة الموقع */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[425px] text-right rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 justify-end">
              أهلاً بك في التقويم المطور
              <Sparkles className="h-6 w-6 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-right pt-2 leading-relaxed">
              لتقديم أدق النصائح الزراعية وتعديل مواعيد التقويم حسب منطقتك، يرجى تحديد موقعك الحالي.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground pr-1 uppercase">الخيار الأول: تحديد آلي</p>
              <Button 
                onClick={handleOnboardingAuto} 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5 gap-3 text-lg"
              >
                <LocateFixed className="h-5 w-5 text-primary" />
                تحديد موقعي آلياً
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold">أو</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground pr-1 uppercase">الخيار الثاني: اختيار يدوي</p>
              <Select onValueChange={setOnboardingCity} value={onboardingCity}>
                <SelectTrigger className="h-14 rounded-2xl border-primary/20 text-right flex-row-reverse">
                  <SelectValue placeholder="اختر مدينتك أو محافظتك" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CLIMATE_ZONES_DATA.map((zone) => (
                    <SelectGroup key={zone.id}>
                      <SelectLabel className="text-primary font-bold pr-8 text-right">{zone.name}</SelectLabel>
                      {zone.cities.map((city) => (
                        <SelectItem key={city} value={city} className="pr-8 text-right flex-row-reverse">{city}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleOnboardingManual} 
              disabled={!onboardingCity}
              className="w-full h-12 bg-primary rounded-xl font-bold text-lg"
            >
              تأكيد الاختيار وحفظ الموقع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
