
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, RefreshCw, ThermometerSun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WeatherCompareProps {
  expectedClimate?: {
    temperature: string;
    notes: string;
  };
}

export default function WeatherCompare({ expectedClimate }: WeatherCompareProps) {
  const [isSyncing, setIsSyncing] = useState(true);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [liveTemp, setLiveTemp] = useState<number>(0);

  useEffect(() => {
    // محاكاة عملية جلب بيانات الطقس الحية من API
    const timer = setTimeout(() => {
      const simulatedLiveTemp = 16; // تم التحديث ليعكس درجة الحرارة الحالية 16م
      setLiveTemp(simulatedLiveTemp);
      
      // حساب التوافق: المتوقع 21م والفعلي 16م (فرق 5 درجات يعتبر انحرافاً ربيعياً طبيعياً)
      const score = 76; 
      setMatchScore(score);
      setIsSyncing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-headline font-bold">مقارنة الطقس الحي</CardTitle>
        <Badge variant="secondary" className={cn(
          "transition-colors duration-500",
          isSyncing ? "bg-muted animate-pulse" : "bg-primary/10 text-primary"
        )}>
          {isSyncing ? (
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> جاري المزامنة...</span>
          ) : (
            "متصل وحي"
          )}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 mb-4">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 bg-primary/5">
            <div className="text-center">
              <span className="text-3xl font-bold apple-text-gradient">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">نسبة التوافق</p>
            </div>
            {!isSyncing && matchScore > 70 && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-black/5 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">الحرارة الفعلية</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold">{isSyncing ? '--' : liveTemp}°م</span>
                <ThermometerSun className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-black/5 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">المتوقع (التقويم)</p>
              <p className="text-xl font-bold">{expectedClimate?.temperature.split(' ')[0] || '21°م'}</p>
            </div>
          </div>

          <div className={cn(
            "p-4 rounded-2xl flex items-start gap-3 transition-opacity duration-500",
            isSyncing ? "opacity-50" : "opacity-100",
            matchScore > 85 ? "bg-primary/5 border border-primary/10" : "bg-orange-50 border border-orange-100"
          )}>
            <AlertTriangle className={cn("h-5 w-5 mt-0.5 shrink-0", matchScore > 85 ? "text-primary" : "text-orange-500")} />
            <div className="text-right">
              <p className="text-xs font-bold mb-1">تحليل التوافق الذكي</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {matchScore > 85 
                  ? "تطابق ممتاز بين تقويم ابن عميرة والظروف الحالية."
                  : "يوجد انخفاض (5 درجات) عن متوسط التقويم. هذا البرد الربيعي المتأخر طبيعي؛ احذر من ري الأشجار في وقت مبكر جداً."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
