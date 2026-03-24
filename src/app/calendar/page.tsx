
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MapPin, Info, Sun, Snowflake, Leaf, Wind, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';

// البيانات الكاملة لتقويم ابن عميرة المناخي 2026 المستخرجة من الصورة
const CALENDAR_DATA = [
  { id: 1, name: "الذراع", cycle: "الأسدية", start: "2026-01-02", end: "2026-01-12", hijri: "13 رجب - 23 رجب", note: "موعد البرد القارس. الرياح غربية وقد تتحول لشرقية سريعة باردة." },
  { id: 2, name: "النثرة", cycle: "الأسدية", start: "2026-01-13", end: "2026-01-25", hijri: "24 رجب - 06 شعبان", note: "درجة الحرارة تصل لأقل مستوى لها طوال العام. رياح شرقية رطبة باردة." },
  { id: 3, name: "الطرف", cycle: "الأسدية", start: "2026-01-26", end: "2026-02-05", hijri: "07 شعبان - 17 شعبان", note: "درجة الحرارة تميل للاعتدال ليلاً. رياح غربية شديدة البرودة وسريعة." },
  
  { id: 4, name: "الجبهة", cycle: "الدبور", start: "2026-02-06", end: "2026-02-19", hijri: "18 شعبان - 02 رمضان", note: "تحسن في درجات الحرارة مع بعض التقلبات. الرياح غالباً غربية إلى جنوبية غربية." },
  { id: 5, name: "الزبرة", cycle: "الدبور", start: "2026-02-20", end: "2026-03-04", hijri: "03 رمضان - 15 رمضان", note: "الجو متقلب من اعتدال إلى برد قارس. الرياح غربية نشطة منذ الظهر." },
  { id: 6, name: "العطف", cycle: "الدبور", start: "2026-03-05", end: "2026-03-16", hijri: "16 رمضان - 27 رمضان", note: "الجو يميل للاعتدال مع برودة ليلاً. الرياح غالباً غربية إلى جنوبية غربية." },
  
  { id: 7, name: "السماك", cycle: "الكنة", start: "2026-03-17", end: "2026-03-28", hijri: "28 رمضان - 10 شوال", note: "الجو معتدل. موسم نزول الأمطار إذا لم تهب الرياح الغربية السريعة." },
  { id: 8, name: "السميك", cycle: "الكنة", start: "2026-03-29", end: "2026-04-09", hijri: "11 شوال - 22 شوال", note: "الجو معتدل جميل جداً إذا لم تهب الرياح الغربية الشديدة." },
  { id: 9, name: "العقرب", cycle: "الكنة", start: "2026-04-10", end: "2026-04-21", hijri: "23 شوال - 04 ذو القعدة", note: "الجو معتدل وقد يتخلله برد قارس. الرياح هادئة متقلبة." },
  { id: 10, name: "العقيرب", cycle: "الكنة", start: "2026-04-22", end: "2026-05-03", hijri: "05 ذو القعدة - 16 ذو القعدة", note: "الجو معتدل يميل للدفء. الرياح متقلبة من شرقية إلى غربية." },
  { id: 11, name: "الكف", cycle: "الكنة", start: "2026-05-04", end: "2026-05-15", hijri: "17 ذو القعدة - 28 ذو القعدة", note: "الجو دافئ يميل للحرارة الملحوظة. الرياح غالباً شرقية إلى جنوبية غربية." },
  
  { id: 12, name: "الثريا", cycle: "الغفر", start: "2026-05-16", end: "2026-05-27", hijri: "29 ذو القعدة - 11 ذو الحجة", note: "الجو دافئ يميل للحرارة كثيراً. الرياح غالباً من شرقية إلى غربية." },
  { id: 13, name: "المجيدح", cycle: "الغفر", start: "2026-05-28", end: "2026-06-08", hijri: "12 ذو الحجة - 22 ذو الحجة", note: "الجو شديد الحرارة. الأمطار نادرة إلى حد ما." },
  { id: 14, name: "الجوزاء", cycle: "الغفر", start: "2026-06-09", end: "2026-06-20", hijri: "23 ذو الحجة - 05 محرم", note: "الجو حار شديد وجاف. الأمطار نادرة وموضعية." },
  { id: 15, name: "المرزم", cycle: "الغفر", start: "2026-06-21", end: "2026-07-02", hijri: "06 محرم - 17 محرم", note: "الجو شديد الحرارة والسموم. الرياح غالباً غربية." },
  
  { id: 16, name: "الذراع", cycle: "الخضر", start: "2026-07-03", end: "2026-07-14", hijri: "18 محرم - 29 محرم", note: "الجو شديد الحرارة. الرياح غالباً غربية، بداية نزول فواكه الطائف." },
  { id: 17, name: "النثرة", cycle: "الخضر", start: "2026-07-15", end: "2026-07-26", hijri: "01 صفر - 12 صفر", note: "الجو صحو شديد الحرارة جاف. الرياح غالباً شرقية إلى شمالية." },
  { id: 18, name: "الطرف", cycle: "الخضر", start: "2026-07-27", end: "2026-08-07", hijri: "13 صفر - 24 صفر", note: "درجة الحرارة تبدأ في الانخفاض. الرياح غربية غربية شبه مستمرة." },
  { id: 19, name: "الجبهة", cycle: "الخضر", start: "2026-08-08", end: "2026-08-21", hijri: "25 صفر - 08 ربيع أول", note: "الجو أقل حرارة من سابقه. بعض الأمطار الموضعية." },
  { id: 20, name: "الزبرة", cycle: "الخضر", start: "2026-08-22", end: "2026-09-02", hijri: "09 ربيع أول - 20 ربيع أول", note: "الجو صاف يميل إلى الصفاء. الرياح غربية إلى جنوبية غربية." },
  { id: 21, name: "العطف", cycle: "الخضر", start: "2026-09-03", end: "2026-09-14", hijri: "21 ربيع أول - 03 ربيع ثاني", note: "الجو يميل للاعتدال ولكنه غير لطيف. رياح جنوبية تميل للجفاف." },
  
  { id: 22, name: "السماك", cycle: "الأنث", start: "2026-09-15", end: "2026-09-26", hijri: "04 ربيع ثاني - 15 ربيع ثاني", note: "الجو معتدل جاف ومتميز عن سابقه. الرياح شرقية صباحاً." },
  { id: 23, name: "السميك", cycle: "الأنث", start: "2026-09-27", end: "2026-10-08", hijri: "16 ربيع ثاني - 27 ربيع ثاني", note: "الجو معتدل جاف يميل للبرد ليلاً. الرياح شرقية إلى جنوبية." },
  { id: 24, name: "العقرب", cycle: "الأنث", start: "2026-10-09", end: "2026-10-20", hijri: "28 ربيع ثاني - 09 جمادى أول", note: "الجو جاف معتدل الحرارة. الرياح غربية نشطة." },
  { id: 25, name: "العقيرب", cycle: "الأنث", start: "2026-10-21", end: "2026-11-01", hijri: "10 جمادى أول - 21 جمادى أول", note: "الجو بارد يميل للبرودة. رياح شمالية غربية مثيرة للأتربة." },
  { id: 26, name: "الكف", cycle: "الأنث", start: "2026-11-02", end: "2026-11-13", hijri: "22 جمادى أول - 03 جمادى ثاني", note: "الجو معتدل أقل جفافاً من سابقه. الرياح شمالية غربية." },
  { id: 27, name: "الثريا", cycle: "الأنث", start: "2026-11-14", end: "2026-11-25", hijri: "04 جمادى ثاني - 15 جمادى ثاني", note: "الجو معتدل يميل للبرودة ليلاً. رياح غربية هادئة." },
  { id: 28, name: "المجيدح", cycle: "الأنث", start: "2026-11-26", end: "2026-12-07", hijri: "16 جمادى ثاني - 27 جمادى ثاني", note: "الجو يميل للبرودة كثيراً. رياح غربية إلى جنوبية." },
  { id: 29, name: "الجوزاء", cycle: "الأنث", start: "2026-12-08", end: "2026-12-19", hijri: "28 جمادى ثاني - 10 رجب", note: "الجو بارد. الرياح غالباً غربية باردة رطبة." },
  { id: 30, name: "المرزم", cycle: "الأنث", start: "2026-12-20", end: "2026-12-31", hijri: "11 رجب - 22 رجب", note: "الجو أكثر برودة. أطول ليل وأقصر نهار. الرياح باردة ورطبة." },
];

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
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
                          ميلادي: {formatDate(nawaa.start)} - {formatDate(nawaa.end)}
                        </div>
                        <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded-md">
                          هجري: {nawaa.hijri}
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
