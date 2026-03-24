
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronRight, MapPin, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

// Accurate Ibn Umayra Calendar Structure for 2026 (Gregorian based as it's a solar calendar)
const seasons = [
  { 
    name: "الوسم", 
    color: "bg-blue-500", 
    description: "بداية الاعتدال ونزول المطر النافع للكمأة.",
    periods: [
      { name: "الصرفة", start: "2026-10-16", end: "2026-10-28", days: 13, note: "انصراف الحر وبداية اعتدال الجو." },
      { name: "العواء", start: "2026-10-29", end: "2026-11-10", days: 13, note: "بداية برودة الليل، مطره ينبت العشب." },
      { name: "السماك", start: "2026-11-11", end: "2026-11-23", days: 13, note: "كثرة الغيوم والأمطار الرعدية." },
      { name: "الغفر", start: "2026-11-24", end: "2026-12-06", days: 13, note: "أجمل أيام الوسم، برودة ملحوظة." }
    ]
  },
  { 
    name: "المربعانية", 
    color: "bg-cyan-600", 
    description: "أشد أيام الشتاء برداً وتسمى 'برد الانصراف'.",
    periods: [
      { name: "الإكليل", start: "2026-12-07", end: "2026-12-19", days: 13, note: "بداية البرد القارس." },
      { name: "القلب", start: "2026-12-20", end: "2027-01-01", days: 13, note: "أطول ليلة في السنة، اشتداد الصقيع." },
      { name: "الشولة", start: "2027-01-02", end: "2027-01-14", days: 13, note: "آخر المربعانية، يشتد فيها الهبوب." }
    ]
  },
  { 
    name: "الشبط", 
    color: "bg-blue-800", 
    description: "برد جاف ورياح شديدة تسمى 'برد البطين'.",
    periods: [
      { name: "النعائم", start: "2027-01-15", end: "2027-01-27", days: 13, note: "بداية هجرة الطيور الربيعية." },
      { name: "البلدة", start: "2027-01-28", end: "2027-02-09", days: 13, note: "بردها شديد ويصل للعظام." }
    ]
  },
  { 
    name: "العقارب", 
    color: "bg-indigo-400", 
    description: "بداية انكسار البرد وظهور الهوام والربيع.",
    periods: [
      { name: "سعد الذابح", start: "2027-02-10", end: "2027-02-22", days: 13, note: "برد العقارب الذي يباغت الناس." },
      { name: "سعد بلع", start: "2027-02-23", end: "2027-03-07", days: 13, note: "تساوي الليل والنهار تقريباً." },
      { name: "سعد السعود", start: "2027-03-08", end: "2027-03-20", days: 13, note: "بداية سريان الماء في عود الأشجار." }
    ]
  },
  { 
    name: "الحميم (الربيع الثاني)", 
    color: "bg-orange-400", 
    description: "بداية الحر وسريان السموم.",
    periods: [
      { name: "سعد الأخبية", start: "2027-03-21", end: "2027-04-02", days: 13, note: "خروج الحشرات من مخابئها." },
      { name: "المقدم", start: "2027-04-03", end: "2027-04-15", days: 13, note: "بداية زراعة المحاصيل الصيفية." },
      { name: "المؤخر", start: "2027-04-16", end: "2027-04-28", days: 13, note: "آخر أيام الاعتدال الربيعي." }
    ]
  }
];

export default function YearlyCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const getHijriDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  };

  const isCurrentPeriod = (start: string, end: string) => {
    if (!currentDate) return false;
    const s = new Date(start);
    const e = new Date(end);
    return currentDate >= s && currentDate <= e;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            تقويم ابن عميرة الزراعي
          </h1>
          <p className="text-muted-foreground text-lg">
            دليل الأنواء والمواسم الزراعية في المملكة - محدث لعام 2026/2027
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground leading-none mb-1">المنطقة</p>
            <p className="font-bold text-sm">حزام المرتفعات (الطائف وما حولها)</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center">
        <div className="bg-primary/10 p-4 rounded-full">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">ملاحظة حول الحساب</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تقويم ابن عميرة يعتمد على الحساب الشمسي (الميلادي) لارتباطه المباشر بالمواسم الزراعية، ولكننا أضفنا التاريخ الهجري المقابل لتسهيل المتابعة التقليدية. الأنواء تتبدل كل 13 يوماً بدقة متناهية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16">
        {seasons.map((season) => (
          <div key={season.name} className="space-y-8">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className={`h-12 w-3 rounded-full ${season.color}`} />
              <div>
                <h2 className="text-3xl font-bold font-headline">{season.name}</h2>
                <p className="text-muted-foreground">{season.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {season.periods.map((period) => {
                const active = isCurrentPeriod(period.start, period.end);
                return (
                  <Card key={period.name} className={`relative overflow-hidden transition-all hover:shadow-lg ${active ? 'ring-2 ring-primary border-primary/50' : ''}`}>
                    {active && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 animate-pulse">
                        النوء الحالي
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold font-headline mb-1">{period.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-primary bg-primary/5 inline-block px-2 py-0.5 rounded">
                          {formatDate(period.start)} - {formatDate(period.end)}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          الموافق هجرياً: {getHijriDate(period.start)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">المدة: {period.days} يوماً</span>
                        <Badge variant="secondary" className="text-[9px]">{season.name}</Badge>
                      </div>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg border border-dashed text-muted-foreground italic leading-relaxed">
                        "{period.note}"
                      </p>
                      <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary/5">
                        عرض التفاصيل الزراعية <ChevronRight className="mr-1 h-3 w-3 rtl:rotate-180" />
                      </Button>
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
