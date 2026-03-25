
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
  const [locationName, setLocationName] = useState<string>("جاري التحديد...");
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, isAuto: boolean) => {
    setIsSyncing(true);
    setError(null);
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
      
      setLocationName(isAuto ? "موقعك الحالي" : "الطائف (المرجع)");
    } catch (err) {
      setError("تعذر جلب البيانات");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocationDetection = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, true),
        () => fetchWeather(21.27, 40.41, false),
        { timeout: 8000 }
      );
    } else {
      fetchWeather(21.27, 40.41, false);
    }
  };

  useEffect(() => {
    handleLocationDetection();
  }, [expectedClimate]);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-bold">مقارنة الطقس الميداني</CardTitle>
        <Badge variant="secondary" className={cn(
          "rounded-full text-[9px] px-2",
          isSyncing ? "animate-pulse" : "bg-primary/10 text-primary"
        )}>
          {isSyncing ? "جاري التحديث" : "بيانات حية"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-primary/10 bg-primary/5">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[8px] text-muted-foreground font-bold uppercase">توافق البيئة</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground bg-muted p-1.5 rounded-lg">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{locationName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-black/5 text-center">
              <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">الحرارة الحالية</p>
              <span className="text-lg font-bold">{isSyncing ? '--' : liveTemp}°م</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-black/5 text-center">
              <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">المتوقع</p>
              <p className="text-lg font-bold">{expectedClimate?.temperature.split(' ')[0] || '21°م'}</p>
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-xl flex items-start gap-3 text-right",
            matchScore > 85 ? "bg-primary/5" : "bg-accent/10"
          )}>
            <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", matchScore > 85 ? "text-primary" : "text-primary/60")} />
            <div className="text-[10px] leading-relaxed">
              <p className="font-bold mb-0.5">تحليل الملاءمة</p>
              <p className="text-muted-foreground">
                {matchScore > 85 
                  ? "توافق ممتاز مع تقويم ابن عميرة."
                  : `الحرارة حالياً (${liveTemp}°م) تختلف عن التقويم. راقب الري بعناية.`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
