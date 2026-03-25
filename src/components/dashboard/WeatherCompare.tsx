
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, RefreshCw, ThermometerSun, MapPin, Info, Navigation } from 'lucide-react';
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
  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("جاري التحديد...");
  const [isOutsideTaif, setIsOutsideTaif] = useState(false);
  const [zoneAdvice, setZoneAdvice] = useState<string>("");

  const TAIF_COORDS = { lat: 21.27, lon: 40.41 };

  // حساب المسافة التقريبية لتحديد ما إذا كان المستخدم خارج الطائف
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295; 
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); 
  };

  const fetchWeather = async (lat: number, lon: number, isAuto: boolean) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!response.ok) throw new Error('فشل المزامنة');
      
      const data = await response.json();
      const currentTemp = Math.round(data.current_weather.temperature);
      setLiveTemp(currentTemp);
      
      const expected = parseInt(expectedClimate?.temperature.split('°')[0] || '21');
      const diff = Math.abs(currentTemp - expected);
      const score = Math.max(0, 100 - (diff * 5)); 
      setMatchScore(Math.round(score));
      
      const distance = calculateDistance(lat, lon, TAIF_COORDS.lat, TAIF_COORDS.lon);
      const outside = distance > 100; // إذا كان أبعد من 100 كم عن الطائف
      setIsOutsideTaif(outside);
      setLocationName(isAuto ? (outside ? "موقعك الحالي" : "منطقة الطائف") : "الطائف (المرجع)");

      // تقديم نصيحة الحزام المناخي بناءً على الموقع
      if (outside) {
        if (lat > 25) {
          setZoneAdvice("أنت في المناطق الشمالية: يرجى تأخير مواعيد الزراعة بـ 14 يوماً عن التقويم بسبب طول فترة الصقيع.");
        } else if (lon > 45) {
          setZoneAdvice("أنت في الهضبة الوسطى أو الشرقية: المواعيد قد تختلف بـ 7-10 أيام (تقديم أو تأخير) حسب حدة الصيف.");
        } else if (lat < 20) {
          setZoneAdvice("أنت في المناطق الجنوبية الساحلية: المناخ أكثر دفئاً ورطوبة، يمكنك تقديم الزراعة بـ 7 أيام.");
        } else {
          setZoneAdvice("أنت خارج النطاق المرجعي المباشر للطائف: يرجى مواءمة المواعيد مع ظروف مزرعتك المحلية.");
        }
      } else {
        setZoneAdvice("أنت في النطاق المرجعي: تقويم ابن عميرة ينطبق على مزرعتك مباشرة وبدقة عالية.");
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocationDetection = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, true),
        () => fetchWeather(TAIF_COORDS.lat, TAIF_COORDS.lon, false),
        { timeout: 8000 }
      );
    } else {
      fetchWeather(TAIF_COORDS.lat, TAIF_COORDS.lon, false);
    }
  };

  useEffect(() => {
    handleLocationDetection();
  }, [expectedClimate]);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-bold">مقارنة الطقس الميداني</CardTitle>
        <Badge variant="secondary" className={cn(
          "rounded-full text-[9px] px-2",
          isSyncing ? "animate-pulse" : "bg-primary/10 text-primary"
        )}>
          {isSyncing ? "جاري التحديث" : "بيانات حية"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-center py-4">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-primary/10 bg-primary/5">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[7px] text-muted-foreground font-bold uppercase">توافق البيئة</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground bg-muted p-1.5 rounded-lg">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{locationName}</span>
            {isOutsideTaif && <Badge variant="outline" className="text-[8px] border-orange-200 text-orange-600 bg-orange-50 py-0 h-4">خارج النطاق المرجعي</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-muted/40 border border-black/5 text-center">
              <p className="text-[7px] text-muted-foreground font-bold uppercase mb-0.5">الحرارة الحالية</p>
              <span className="text-base font-bold">{isSyncing ? '--' : liveTemp}°م</span>
            </div>
            <div className="p-2 rounded-xl bg-muted/40 border border-black/5 text-center">
              <p className="text-[7px] text-muted-foreground font-bold uppercase mb-0.5">المتوقع (الطائف)</p>
              <p className="text-base font-bold">{expectedClimate?.temperature.split(' ')[0] || '21°م'}</p>
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-xl flex items-start gap-2 text-right",
            isOutsideTaif ? "bg-orange-50 border border-orange-100" : "bg-primary/5"
          )}>
            {isOutsideTaif ? <Info className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />}
            <div className="text-[10px] leading-relaxed">
              <p className="font-bold mb-0.5">{isOutsideTaif ? "تعليمات الحزام المناخي" : "تحليل الملاءمة"}</p>
              <p className="text-muted-foreground italic">
                {zoneAdvice}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
