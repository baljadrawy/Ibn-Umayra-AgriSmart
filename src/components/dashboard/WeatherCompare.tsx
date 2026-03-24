
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, RefreshCw, ThermometerSun, MapPin, Navigation } from 'lucide-react';
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
  const [locationName, setLocationName] = useState<string>("جاري تحديد الموقع...");
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, isAuto: boolean) => {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (!response.ok) throw new Error('فشل الاتصال بمصدر البيانات');
      
      const data = await response.json();
      const currentTemp = Math.round(data.current_weather.temperature);
      setLiveTemp(currentTemp);
      
      // حساب التوافق مع التقويم (المرجع الافتراضي 21 درجة لنجم السماك)
      const expected = parseInt(expectedClimate?.temperature.split('°')[0] || '21');
      const diff = Math.abs(currentTemp - expected);
      const score = Math.max(0, 100 - (diff * 5)); 
      setMatchScore(Math.round(score));
      
      if (isAuto) {
        setLocationName("موقعك الحالي");
      } else {
        setLocationName("الطائف (المرجع)");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("تعذر جلب البيانات الحية");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocationDetection = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude, true);
        },
        (error) => {
          console.warn("Geolocation error, falling back to Taif:", error);
          // Fallback to Taif
          fetchWeather(21.27, 40.41, false);
        },
        { timeout: 10000 }
      );
    } else {
      // Fallback if geolocation not supported
      fetchWeather(21.27, 40.41, false);
    }
  };

  useEffect(() => {
    handleLocationDetection();
  }, [expectedClimate]);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-headline font-bold">مقارنة الطقس الواقعي</CardTitle>
        <Badge variant="secondary" className={cn(
          "transition-colors duration-500 rounded-full",
          isSyncing ? "bg-muted animate-pulse" : "bg-primary/10 text-primary"
        )}>
          {isSyncing ? (
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> جاري المزامنة...</span>
          ) : (
            <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> بيانات حية</span>
          )}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 mb-4">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/10 bg-primary/5 transition-transform group-hover:scale-105 duration-500">
            <div className="text-center">
              <span className="text-3xl font-bold apple-text-gradient">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">توافق البيئة</p>
            </div>
            {!isSyncing && matchScore > 80 && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 py-2 rounded-lg">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="font-medium">{locationName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-black/5 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">الحرارة الحالية</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold">{isSyncing ? '--' : liveTemp}°م</span>
                <ThermometerSun className="h-4 w-4 text-orange-500" />
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
            error ? "bg-red-50 border border-red-100" : (matchScore > 85 ? "bg-primary/5 border border-primary/10" : "bg-orange-50 border border-orange-100")
          )}>
            {error ? (
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
            ) : (
              <AlertTriangle className={cn("h-5 w-5 mt-0.5 shrink-0", matchScore > 85 ? "text-primary" : "text-orange-500")} />
            )}
            <div className="text-right">
              <p className="text-xs font-bold mb-1">{error ? "خطأ في الاتصال" : "تحليل التوافق الذكي"}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {error 
                  ? "تعذر جلب درجات الحرارة الحقيقية، يرجى التحقق من اتصال الإنترنت."
                  : (matchScore > 85 
                    ? "تطابق ممتاز بين الواقع الميداني في موقعك وما ورد في تقويم ابن عميرة."
                    : `درجة الحرارة في موقعك (${liveTemp}°م) تختلف عن متوسط التقويم. استمر في مراقبة رطوبة التربة وتجنب الري وقت الظهيرة.`)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLocationDetection}
            className="w-full py-2 text-[10px] text-primary font-bold hover:underline flex items-center justify-center gap-1"
            disabled={isSyncing}
          >
            <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
            تحديث الموقع والبيانات الآن
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
