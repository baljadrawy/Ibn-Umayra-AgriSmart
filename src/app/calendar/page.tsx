
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MapPin, Info, Sun, Snowflake, Leaf, Sprout, Wind, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';

// Accurate Ibn Umayra Calendar Data (Solar-based)
const seasons = [
  { 
    name: "موسم سهيل", 
    color: "bg-yellow-600", 
    icon: Sun,
    description: "بداية انكسار حدة الصيف وظهور نجم سهيل.",
    periods: [
      { name: "الطرفة", startMonth: 8, startDay: 24, days: 13, note: "نضج بواكر التمور، يبرد الليل قليلاً." },
      { name: "الجبهة", startMonth: 9, startDay: 6, days: 14, note: "أول النجوم التي يبرد فيها الجو فعلياً." },
      { name: "الزبرة", startMonth: 9, startDay: 20, days: 13, note: "تزداد البرودة ليلاً، مناسب لزراعة الورقيات." },
      { name: "الصرفة", startMonth: 10, startDay: 3, days: 13, note: "انصراف الحر تماماً، وبداية اعتدال النهار." }
    ]
  },
  { 
    name: "موسم الوسم", 
    color: "bg-amber-600", 
    icon: Leaf,
    description: "أفضل أوقات الأمطار النافعة التي تنبت الفقع والعشب.",
    periods: [
      { name: "العواء", startMonth: 10, startDay: 16, days: 13, note: "بداية مطر الوسم النافع، يعتدل الجو نهاراً." },
      { name: "السماك (العطف)", startMonth: 10, startDay: 29, days: 13, note: "يشتد فيه مطر الوسم، وتكثر الغيوم." },
      { name: "الغفر", startMonth: 11, startDay: 11, days: 13, note: "تزداد البرودة، وهو من ألطف أيام السنة." },
      { name: "الزبانا", startMonth: 11, startDay: 24, days: 13, note: "آخر نجوم الوسم، يشتد فيه البرد ليلاً." }
    ]
  },
  { 
    name: "موسم المربعانية", 
    color: "bg-blue-600", 
    icon: Snowflake,
    description: "أشد أيام الشتاء برودة (برد الانصراف).",
    periods: [
      { name: "الإكليل", startMonth: 12, startDay: 7, days: 13, note: "بداية المربعانية والبرد القارس." },
      { name: "القلب", startMonth: 12, startDay: 20, days: 13, note: "أطول ليلة في السنة، اشتداد الصقيع." },
      { name: "الشولة", startMonth: 1, startDay: 2, days: 13, note: "آخر المربعانية، يشتد فيها الهبوب والبرد." }
    ]
  },
  { 
    name: "موسم الشبط", 
    color: "bg-cyan-800", 
    icon: Wind,
    description: "يسمى برد (البطين)، يتميز بالرياح المتقلبة.",
    periods: [
      { name: "النعائم", startMonth: 1, startDay: 15, days: 13, note: "يشتد فيها البرد، وتبدأ الطيور بالهجرة." },
      { name: "البلدة", startMonth: 1, startDay: 28, days: 13, note: "بردها جاف وشديد، يسمى برد العظام." }
    ]
  },
  { 
    name: "موسم العقارب", 
    color: "bg-emerald-600", 
    icon: Sprout,
    description: "انكسار البرد وبداية سريان الماء في العود.",
    periods: [
      { name: "سعد الذابح", startMonth: 2, startDay: 10, days: 13, note: "برد العقارب الذي يباغت الناس (عقرب السم)." },
      { name: "سعد بلع", startMonth: 2, startDay: 23, days: 13, note: "يبدأ الدفء نهاراً (عقرب الدم)." },
      { name: "سعد السعود", startMonth: 3, startDay: 8, days: 13, note: "اعتدال تام وخروج الحشرات (عقرب الدسم)." }
    ]
  },
  { 
    name: "موسم الحميمين", 
    color: "bg-orange-500", 
    icon: Sun,
    description: "بداية الصيف والحرارة وتفتح الثمار.",
    periods: [
      { name: "سعد الأخبية", startMonth: 3, startDay: 21, days: 13, note: "خروج الهوام من مخابئها لدفء الأرض." },
      { name: "المقدم", startMonth: 4, startDay: 3, days: 13, note: "بداية زراعة الخضروات الصيفية." },
      { name: "المؤخر", startMonth: 4, startDay: 16, days: 13, note: "نهاية الربيع وبداية الحرارة الفعلية." }
    ]
  }
];

export default function YearlyCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const getHijriDate = (month: number, day: number) => {
    try {
      const year = new Date().getFullYear();
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
      }).format(date);
    } catch (e) {
      return "غير متوفر";
    }
  };

  const formatMiladiDate = (month: number, day: number) => {
    const year = new Date().getFullYear();
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  };

  const isCurrentPeriod = (month: number, day: number, days: number) => {
    if (!currentDate) return false;
    const year = currentDate.getFullYear();
    const start = new Date(year, month - 1, day);
    const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    
    // Year-wrap handling (Dec to Jan)
    if (month === 12 && day + days > 31) {
        const nextYearEnd = new Date(year + 1, 0, (day + days) - 31);
        return (currentDate >= start) || (currentDate <= nextYearEnd);
    }

    return currentDate >= start && currentDate <= end;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            تقويم ابن عميرة الزراعي (الميلادي)
          </h1>
          <p className="text-muted-foreground text-lg">
            المرجع الثابت للأنواء والمواسم حسب الدورة الشمسية مع المقابل الهجري
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground leading-none mb-1">المنطقة المرجعية</p>
            <p className="font-bold text-sm">الحجاز ومرتفعات المملكة</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center text-right shadow-sm">
        <div className="bg-primary/10 p-4 rounded-full shrink-0">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">ملاحظة هامة للمزارع</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تم ضبط هذا التقويم بناءً على **التاريخ الميلادي** لضمان دقة الفصول الزراعية (دورة الشمس)، ويتم تحديث التاريخ الهجري المقابل آلياً حسب تقويم أم القرى.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16">
        {seasons.map((season) => (
          <div key={season.name} className="space-y-8">
            <div className="flex items-center gap-4 border-b pb-4 text-right">
              <div className={`h-12 w-3 rounded-full ${season.color}`} />
              <div className="flex items-center gap-3">
                <season.icon className="h-8 w-8 text-primary/60" />
                <div>
                  <h2 className="text-3xl font-bold font-headline">{season.name}</h2>
                  <p className="text-muted-foreground">{season.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {season.periods.map((period) => {
                const active = isCurrentPeriod(period.startMonth, period.startDay, period.days);
                return (
                  <Card key={period.name} className={`relative overflow-hidden transition-all hover:shadow-xl text-right border-2 ${active ? 'ring-4 ring-primary/20 border-primary bg-primary/5' : 'border-border'}`}>
                    {active && (
                      <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-br-lg z-10 shadow-sm">
                        النجم الحالي الآن
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold font-headline mb-2">{period.name}</CardTitle>
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-primary bg-primary/10 inline-flex items-center gap-2 px-3 py-1.5 rounded-md w-full">
                          <Sun className="h-3 w-3" />
                          ميلادي: {formatMiladiDate(period.startMonth, period.startDay)}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-md w-full flex items-center gap-2">
                          <Droplets className="h-3 w-3" />
                          هجري: {getHijriDate(period.startMonth, period.startDay)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs border-y py-2">
                        <span className="text-muted-foreground">المدة: {period.days} يوماً</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/30">فصل {season.name.split(' ')[1]}</Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/40 border-r-4 border-primary/50">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                          {period.note}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
