
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, ThermometerSun, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// قاعدة بيانات المدن وإحداثياتها التقريبية لضمان جلب الطقس آلياً لكل مدينة
const CITIES_COORDINATES: Record<string, { lat: number, lon: number }> = {
  // المرتفعات
  'الطائف': { lat: 21.27, lon: 40.41 },
  'أبها': { lat: 18.21, lon: 42.50 },
  'الباحة': { lat: 20.01, lon: 41.46 },
  'النماص': { lat: 19.11, lon: 42.13 },
  'خميس مشيط': { lat: 18.30, lon: 42.73 },
  // الوسطى
  'الرياض': { lat: 24.71, lon: 46.67 },
  'بريدة': { lat: 26.32, lon: 43.97 },
  'عنيزة': { lat: 26.08, lon: 43.99 },
  'حائل': { lat: 27.52, lon: 41.68 },
  'الخرج': { lat: 24.15, lon: 47.31 },
  // الشرقية
  'الدمام': { lat: 26.43, lon: 50.10 },
  'الخبر': { lat: 26.28, lon: 50.20 },
  'الأحساء': { lat: 25.38, lon: 49.58 },
  'حفر الباطن': { lat: 28.43, lon: 45.95 },
  // الغربية
  'جدة': { lat: 21.54, lon: 39.17 },
  'مكة المكرمة': { lat: 21.42, lon: 39.82 },
  'المدينة المنورة': { lat: 24.46, lon: 39.61 },
  'ينبع': { lat: 24.08, lon: 38.06 },
  'جازان': { lat: 16.88, lon: 42.55 },
  // الشمالية
  'تبوك': { lat: 28.38, lon: 36.56 },
  'سكاكا': { lat: 29.96, lon: 40.20 },
  'عرعر': { lat: 30.97, lon: 41.03 },
  'القريات': { lat: 31.33, lon: 37.34 },
};

const CLIMATE_ZONES_DATA = [
  {
    id: 'highlands',
    name: 'المرتفعات الجبلية',
    offset: 0,
    advice: 'أنت في النطاق المرجعي: تقويم ابن عميرة ينطبق على مزرعتك مباشرة وبدقة عالية.',
    cities: ['الطائف', 'أبها', 'الباحة', 'النماص', 'خميس مشيط']
  },
  {
    id: 'central',
    name: 'الهضبة الوسطى',
    offset: 7,
    advice: 'المناخ قاري: يرجى تأخير مواعيد الزراعة بـ 7 أيام عن التقويم الأصلي.',
    cities: ['الرياض', 'بريدة', 'عنيزة', 'حائل', 'الخرج']
  },
  {
    id: 'east',
    name: 'السهول الشرقية',
    offset: -10,
    advice: 'دفء مبكر: يمكنك تقديم مواعيد الزراعة بـ 10 أيام عن التقويم نظراً للدفء المبكر.',
    cities: ['الدمام', 'الخبر', 'الأحساء', 'حفر الباطن']
  },
  {
    id: 'west',
    name: 'السهول الغربية',
    offset: -7,
    advice: 'مناخ الساحل: قدم مواعيد الزراعة بـ 7 أيام، المنطقة مناسبة للمحاصيل الاستوائية.',
    cities: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'ينبع', 'جازان']
  },
  {
    id: 'north',
    name: 'المناطق الشمالية',
    offset: 14,
    advice: 'صقيع ممتد: يرجى تأخير مواعيد الزراعة بـ 14 يوماً لحماية الشتلات من البرد.',
    cities: ['تبوك', 'سكاكا', 'عرعر', 'القريات']
  }
];

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
  const [selectedCity, setSelectedCity] = useState<string>("الطائف");
  const [currentZone, setCurrentZone] = useState(CLIMATE_ZONES_DATA[0]);
  const [isAutoLocation, setIsAutoLocation] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number, locationName: string, isAuto: boolean) => {
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
      
      if (isAuto) {
        setSelectedCity(locationName);
        setIsAutoLocation(true);
      } else {
        setIsAutoLocation(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [expectedClimate]);

  const handleCityChange = (cityName: string) => {
    if (cityName === "auto") {
      handleAutoDetect();
      return;
    }

    setSelectedCity(cityName);
    setIsAutoLocation(false);
    
    // البحث عن الحزام
    const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(cityName)) || CLIMATE_ZONES_DATA[0];
    setCurrentZone(zone);
    
    // جلب الإحداثيات والطقس آلياً للمدينة المختارة
    const coords = CITIES_COORDINATES[cityName] || CITIES_COORDINATES['الطائف'];
    fetchWeather(coords.lat, coords.lon, cityName, false);
  };

  const handleAutoDetect = () => {
    if ("geolocation" in navigator) {
      setIsSyncing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "موقعك الحالي", true),
        () => {
          handleCityChange("الطائف");
        },
        { timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    // جلب الطقس الابتدائي للطائف
    handleCityChange("الطائف");
  }, []);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1 text-right w-full">
          <CardTitle className="text-sm font-bold flex items-center justify-end gap-2 text-primary">
            {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
            مقارنة الطقس الميداني
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">مزامنة آليّة عند تغيير المدينة</p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={isAutoLocation ? "auto" : selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="h-10 rounded-xl border-primary/20 bg-muted/30 focus:ring-primary text-right flex-row-reverse">
                <SelectValue placeholder="اختر مدينتك" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {isAutoLocation && <SelectItem value="auto">موقعك الحالي</SelectItem>}
                {CLIMATE_ZONES_DATA.map((zone) => (
                  <SelectGroup key={zone.id}>
                    <SelectLabel className="text-primary font-bold pr-8 text-right">{zone.name}</SelectLabel>
                    {zone.cities.map((city) => (
                      <SelectItem key={city} value={city} className="pr-8 text-right flex-row-reverse">{city}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn("h-10 w-10 rounded-xl transition-all", isAutoLocation && "bg-primary text-white border-primary")}
            onClick={handleAutoDetect}
            title="تحديد الموقع آلياً"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-primary/5 bg-primary/5 shadow-inner transition-transform hover:scale-105">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary tracking-tighter">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">نسبة التوافق</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-black/5 text-center transition-colors hover:bg-muted/60">
            <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">الحرارة في {selectedCity}</p>
            <span className="text-xl font-bold text-foreground">{isSyncing ? '--' : liveTemp}°م</span>
          </div>
          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-[8px] text-primary font-bold uppercase mb-1">المتوقع في التقويم</p>
            <p className="text-xl font-bold text-primary">{expectedClimate?.temperature.split(' ')[0] || '21°م'}</p>
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-2xl flex items-start gap-3 text-right transition-all",
          currentZone.offset !== 0 ? "bg-orange-50 border border-orange-100" : "bg-primary/5 border border-primary/10"
        )}>
          {currentZone.offset !== 0 ? 
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" /> : 
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          }
          <div className="space-y-1">
            <div className="flex items-center justify-end gap-2">
              <p className="font-bold text-xs">تحليل {currentZone.name}</p>
              {currentZone.offset !== 0 && (
                <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-600 py-0 h-4">
                  تعديل: {currentZone.offset > 0 ? `+${currentZone.offset}` : currentZone.offset} يوم
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              {currentZone.advice}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
