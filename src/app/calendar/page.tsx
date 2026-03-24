
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronRight, MapPin, Info, Sun, Snowflake, Leaf, Sprout } from 'lucide-react';
import { useState, useEffect } from 'react';

// Accurate Ibn Umayra Calendar Structure
// This calendar is solar-based, so dates are fixed in Gregorian.
const seasons = [
  { 
    name: "فصل الخريف (الوسم)", 
    color: "bg-amber-600", 
    icon: Leaf,
    description: "بداية انكسار الحرارة ونزول الأمطار النافعة.",
    periods: [
      { name: "الصرفة", startMonth: 10, startDay: 16, days: 13, note: "انصراف الحر وبداية اعتدال الجو." },
      { name: "العواء", startMonth: 10, startDay: 29, days: 13, note: "بداية برودة الليل، مطره ينبت العشب." },
      { name: "السماك (العطف)", startMonth: 11, startDay: 11, days: 13, note: "كثرة الغيوم والأمطار الرعدية." },
      { name: "الغفر", startMonth: 11, startDay: 24, days: 13, note: "أجمل أيام الوسم، برودة ملحوظة." }
    ]
  },
  { 
    name: "فصل الشتاء (المربعانية)", 
    color: "bg-blue-600", 
    icon: Snowflake,
    description: "أشد أيام السنة برداً، تسمى برد الانصراف.",
    periods: [
      { name: "الإكليل", startMonth: 12, startDay: 7, days: 13, note: "بداية البرد القارس الفعلي." },
      { name: "القلب", startMonth: 12, startDay: 20, days: 13, note: "أطول ليلة في السنة، اشتداد الصقيع." },
      { name: "الشولة", startMonth: 1, startDay: 2, days: 13, note: "آخر المربعانية، يشتد فيها الهبوب." }
    ]
  },
  { 
    name: "برد البطين (الشبط)", 
    color: "bg-cyan-800", 
    icon: Snowflake,
    description: "رياح شديدة ومتقلبة، البرد يهاجم العظام.",
    periods: [
      { name: "النعائم", startMonth: 1, startDay: 15, days: 13, note: "بداية هجرة الطيور الربيعية." },
      { name: "البلدة", startMonth: 1, startDay: 28, days: 13, note: "بردها شديد وجاف." }
    ]
  },
  { 
    name: "فصل الربيع (العقارب)", 
    color: "bg-emerald-600", 
    icon: Sprout,
    description: "بداية انكسار البرد وسريان الماء في الأشجار.",
    periods: [
      { name: "سعد الذابح", startMonth: 2, startDay: 10, days: 13, note: "برد العقارب الذي يباغت الناس." },
      { name: "سعد بلع", startMonth: 2, startDay: 23, days: 13, note: "تساوي الليل والنهار تقريباً." },
      { name: "سعد السعود", startMonth: 3, startDay: 8, days: 13, note: "بداية خروج الحشرات وبداية الدفء." }
    ]
  },
  { 
    name: "فصل الصيف (الحميم)", 
    color: "bg-orange-500", 
    icon: Sun,
    description: "بداية الحرارة الفعلية ونضج الثمار.",
    periods: [
      { name: "سعد الأخبية", startMonth: 3, startDay: 21, days: 13, note: "خروج الهوام من مخابئها." },
      { name: "المقدم", startMonth: 4, startDay: 3, days: 13, note: "بداية زراعة المحاصيل الصيفية." },
      { name: "المؤخر", startMonth: 4, startDay: 16, days: 13, note: "آخر أيام الاعتدال الربيعي." }
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
      // Use current year for visualization
      const year = new Date().getFullYear();
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
      }).format(date);
    } catch (e) {
      return "";
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
    return currentDate >= start && currentDate <= end;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            تقويم ابن عميرة الزراعي
          </h1>
          <p className="text-muted-foreground text-lg">
            دليل الأنواء والمواسم - مرجع المزارع في المملكة
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground leading-none mb-1">المنطقة المرجعية</p>
            <p className="font-bold text-sm">الحجاز والمرتفعات (الطائف)</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center text-right">
        <div className="bg-primary/10 p-4 rounded-full shrink-0">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">دليل الاستخدام</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            يعتمد هذا التقويم على **الدورة الشمسية (الميلادية)** لثبات الفصول الزراعية فيها. يتم عرض التاريخ الهجري المقابل كمرجع إضافي. كل نوء يستمر لمدة 13 يوماً.
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
                  <Card key={period.name} className={`relative overflow-hidden transition-all hover:shadow-lg text-right ${active ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : ''}`}>
                    {active && (
                      <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 animate-pulse">
                        النوء الحالي
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold font-headline mb-2">{period.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-primary bg-primary/10 inline-block px-3 py-1 rounded-md">
                          يبدأ في: {formatMiladiDate(period.startMonth, period.startDay)}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          الموافق تقريباً: {getHijriDate(period.startMonth, period.startDay)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">المدة: {period.days} يوماً</span>
                        <Badge variant="secondary" className="text-[9px] font-bold">فترة {season.name.split(' ')[0]}</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border border-dashed border-primary/20">
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          "{period.note}"
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
