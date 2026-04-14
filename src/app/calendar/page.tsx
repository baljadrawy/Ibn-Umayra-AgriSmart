
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MapPin, Info, Sun, Snowflake, Leaf, Wind, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CALENDAR_2026 } from '@/lib/location-data';

// تحويل التاريخ الهجري ديناميكياً بتقويم أم القرى — يعمل لأي سنة
function toHijri(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    } as Intl.DateTimeFormatOptions);
  } catch {
    return '';
  }
}

// يأخذ السنة الحالية تلقائياً — يعمل لأي سنة
const toFullDate = (mmdd: string) => {
  const year = new Date().getFullYear();
  return `${year}-${mmdd}`;
};

const CALENDAR_DATA = CALENDAR_2026.map(n => ({
  id: n.id,
  name: n.name,
  cycle: n.cycle,
  start: toFullDate(n.start),
  end: toFullDate(n.end),
  hijriStart: toHijri(toFullDate(n.start)),
  hijriEnd: toHijri(toFullDate(n.end)),
  note: n.note,
}));

const cycles = [
  { name: "الأسدية", icon: Sun, color: "bg-yellow-600" },
  { name: "الدبور", icon: Wind, color: "bg-blue-400" },
  { name: "الكنة", icon: Leaf, color: "bg-emerald-500" },
  { name: "الغفر", icon: Sun, color: "bg-orange-500" },
  { name: "الخضر", icon: Droplets, color: "bg-green-600" },
  { name: "الأنث", icon: Snowflake, color: "bg-cyan-700" },
];

export default function YearlyCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const isCurrent = (start: string, end: string) => {
    if (!currentDate) return false;
    const today = currentDate.toISOString().split('T')[0];
    return today >= start && today <= end;
  };

  // تصحيح: استخدام التقويم الميلادي الصريح لضمان ظهور أسماء الأشهر الميلادية
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2 text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            تقويم ابن عميرة الزراعي 2026
          </h1>
          <p className="text-muted-foreground text-lg">
            المرجع التاريخي المعتمد للأنواء والمواسم حسب الدورة الشمسية
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

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-16 flex flex-col md:flex-row gap-6 items-center text-right shadow-sm">
        <div className="bg-primary/10 p-4 rounded-full shrink-0">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">دليل المواسم 2026</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تم ضبط هذا التقويم آلياً لعام 2026 بناءً على المخطط التاريخي المرفق، مع مراعاة التواريخ الميلادية الثابتة والهجرية المتغيرة.
          </p>
        </div>
      </div>

      <div className="space-y-20">
        {cycles.map((cycle) => (
          <div key={cycle.name} className="space-y-8">
            <div className="flex items-center gap-4 border-b pb-4 text-right">
              <div className={`h-12 w-3 rounded-full ${cycle.color}`} />
              <div className="flex items-center gap-3">
                <cycle.icon className="h-8 w-8 text-primary/60" />
                <h2 className="text-3xl font-bold font-headline">دورة {cycle.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CALENDAR_DATA.filter(n => n.cycle === cycle.name).map((nawaa) => {
                const active = isCurrent(nawaa.start, nawaa.end);
                return (
                  <Card key={nawaa.id} className={`relative overflow-hidden transition-all hover:shadow-xl text-right border-2 ${active ? 'ring-4 ring-primary/20 border-primary bg-primary/5' : 'border-border'}`}>
                    {active && (
                      <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-br-lg z-10">
                        النجم الحالي
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-[10px]">{nawaa.id}</Badge>
                        <CardTitle className="text-2xl font-bold font-headline">{nawaa.name}</CardTitle>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-primary bg-primary/10 p-2 rounded-md">
                          {formatDate(nawaa.start)} — {formatDate(nawaa.end)}
                        </div>
                        <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded-md leading-relaxed">
                          {nawaa.hijriStart} — {nawaa.hijriEnd}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-lg bg-muted/40 border-r-4 border-primary/50 text-sm leading-relaxed">
                        {nawaa.note}
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
