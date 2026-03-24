
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

const seasons = [
  { 
    name: "الوسم", 
    color: "bg-blue-500", 
    periods: ["العطف", "السماك", "الفرع", "الشولة"],
    description: "بداية الاعتدال ونزول المطر النافع."
  },
  { 
    name: "المربعانية", 
    color: "bg-cyan-600", 
    periods: ["الإكليل", "القلب", "الشولة"],
    description: "أشد أيام الشتاء برداً."
  },
  { 
    name: "الشبط", 
    color: "bg-blue-800", 
    periods: ["النعائم", "البلدة"],
    description: "برد جاف ورياح شديدة."
  },
  { 
    name: "العقارب", 
    color: "bg-indigo-400", 
    periods: ["سعد الذابح", "سعد بلع", "سعد السعود"],
    description: "بداية انكسار البرد وظهور الهوام."
  },
  { 
    name: "الحميم", 
    color: "bg-orange-400", 
    periods: ["سعد الأخبية", "المقدم", "المؤخر"],
    description: "بداية الحر والسموم."
  }
];

export default function YearlyCalendar() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <CalendarIcon className="h-8 w-8" />
            تقويم ابن عميرة الزراعي 2026
          </h1>
          <p className="text-muted-foreground text-lg">
            عرض سنوي لجميع الأنواء والمواسم الزراعية في المملكة العربية السعودية.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground leading-none mb-1">المنطقة المختارة</p>
            <p className="font-bold text-sm">حزام المرتفعات (الطائف)</p>
          </div>
          <Button variant="outline" size="sm" className="mr-4">تغيير</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {seasons.map((season) => (
          <div key={season.name} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-2 rounded-full ${season.color}`} />
              <div>
                <h2 className="text-2xl font-bold font-headline">{season.name}</h2>
                <p className="text-sm text-muted-foreground">{season.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {season.periods.map((period, idx) => (
                <Card key={period} className="group hover:border-primary transition-colors cursor-pointer relative overflow-hidden">
                  {idx === 0 && season.name === "الوسم" && (
                    <div className="absolute top-0 right-0 p-1 bg-accent text-[8px] font-bold uppercase tracking-wider text-accent-foreground z-10 px-2 rounded-bl">
                      النوء الحالي
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold font-headline">{period}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">١٣ يوماً</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      تبدأ من ٧ مارس - تنتهي ٢٠ مارس
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${season.color} opacity-30`} 
                          style={{ width: idx === 0 && season.name === "الوسم" ? '62%' : '0%' }} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "أوان زراعة الورقيات ونقل شتلات الطماطم والباذنجان..."
                      </p>
                      <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary/5 hover:text-primary">
                        التفاصيل الكاملة <ChevronRight className="mr-1 h-3 w-3 rtl:rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
