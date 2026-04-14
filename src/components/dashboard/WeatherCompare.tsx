
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, LocateFixed, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CLIMATE_ZONES_DATA, CITIES_COORDINATES, getNearestCity } from '@/lib/location-data';

interface WeatherCompareProps {
  expectedClimate?: {
    temperature: string;
    expectedTemp?: number;
    notes: string;
  };
  onLocationUpdate?: (city: string, temp: number, zoneId: string) => void;
}

// حساب نسبة التوافق بشكل أذكى بناءً على الفرق النسبي لا المطلق
function calcMatchScore(liveTemp: number, expectedTemp: number): number {
  const diff = Math.abs(liveTemp - expectedTemp);
  // الهامش المقبول يتغير حسب درجة الحرارة المتوقعة نفسها
  // في الصيف (>30°) هامش ±5 معقول، في الشتاء (<15°) هامش ±3 أدق
  const tolerance = expectedTemp > 30 ? 7 : expectedTemp > 20 ? 5 : 3;
  if (diff === 0) return 100;
  if (diff <= tolerance * 0.5) return 90;
  if (diff <= tolerance) return Math.round(100 - (diff / tolerance) * 30);
  if (diff <= tolerance * 2) return Math.round(70 - (diff / tolerance) * 15);
  return Math.max(10, Math.round(40 - diff * 2));
}

function getTrendIcon(liveTemp: number, expectedTemp: number) {
  const diff = liveTemp - expectedTemp;
  if (Math.abs(diff) <= 2) return { icon: Minus, label: 'متوافق', color: 'text-primary' };
  if (diff > 0) return { icon: TrendingUp, label: `+${Math.round(diff)}° أعلى`, color: 'text-orange-500' };
  return { icon: TrendingDown, label: `${Math.round(diff)}° أقل`, color: 'text-blue-500' };
}

export default function WeatherCompare({ expectedClimate, onLocationUpdate }: WeatherCompareProps) {
  const [isSyncing, setIsSyncing] = useState(true);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [liveWindspeed, setLiveWindspeed] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("الطائف");
  const [currentZone, setCurrentZone] = useState(CLIMATE_ZONES_DATA[0]);
  const [isAutoLocation, setIsAutoLocation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchWeather = useCallback(async (lat: number, lon: number, locationName: string, isAuto: boolean) => {
    setIsSyncing(true);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability&timezone=auto&forecast_days=1`
      );
      if (!response.ok) throw new Error('فشل المزامنة');

      const data = await response.json();
      const currentTemp = Math.round(data.current_weather.temperature);
      const windspeed = Math.round(data.current_weather.windspeed);
      setLiveTemp(currentTemp);
      setLiveWindspeed(windspeed);

      const expected = expectedClimate?.expectedTemp ?? parseInt(expectedClimate?.temperature.split('°')[0] || '21');
      setMatchScore(calcMatchScore(currentTemp, expected));
      setLastUpdated(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));

      let finalCityName = locationName;
      if (isAuto) finalCityName = getNearestCity(lat, lon);

      const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(finalCityName)) || CLIMATE_ZONES_DATA[0];
      setSelectedCity(finalCityName);
      setCurrentZone(zone);

      if (isAuto) {
        setIsAutoLocation(true);
        localStorage.setItem('user_city', finalCityName);
        localStorage.setItem('user_lat', lat.toString());
        localStorage.setItem('user_lon', lon.toString());
        localStorage.setItem('user_is_auto', 'true');
      } else {
        setIsAutoLocation(false);
        localStorage.setItem('user_city', finalCityName);
        localStorage.removeItem('user_lat');
        localStorage.removeItem('user_lon');
        localStorage.removeItem('user_is_auto');
      }

      if (onLocationUpdate) onLocationUpdate(finalCityName, currentTemp, zone.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [expectedClimate, onLocationUpdate]);

  const handleCityChange = useCallback((cityName: string) => {
    if (cityName === "auto") { handleAutoDetect(); return; }
    setSelectedCity(cityName);
    setIsAutoLocation(false);
    const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(cityName)) || CLIMATE_ZONES_DATA[0];
    setCurrentZone(zone);
    const coords = CITIES_COORDINATES[cityName] || CITIES_COORDINATES['الطائف'];
    fetchWeather(coords.lat, coords.lon, cityName, false);
  }, [fetchWeather]);

  const handleAutoDetect = () => {
    if ("geolocation" in navigator) {
      setIsSyncing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "جاري التعرف...", true),
        () => handleCityChange("الطائف"),
        { timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    const savedCity = localStorage.getItem('user_city');
    const savedLat = localStorage.getItem('user_lat');
    const savedLon = localStorage.getItem('user_lon');
    const isAuto = localStorage.getItem('user_is_auto') === 'true';

    if (isAuto && savedLat && savedLon) {
      fetchWeather(parseFloat(savedLat), parseFloat(savedLon), "جاري التعرف...", true);
    } else if (savedCity && CITIES_COORDINATES[savedCity]) {
      handleCityChange(savedCity);
    } else {
      handleCityChange("الطائف");
    }
  }, []);

  const scoreColor = matchScore >= 80 ? 'text-primary' : matchScore >= 55 ? 'text-orange-500' : 'text-red-500';
  const scoreBg   = matchScore >= 80 ? 'bg-primary/5 border-primary/20' : matchScore >= 55 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100';
  const expectedTemp = expectedClimate?.expectedTemp ?? parseInt(expectedClimate?.temperature.split('°')[0] || '21');
  const trend = liveTemp !== null ? getTrendIcon(liveTemp, expectedTemp) : null;

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1 text-right w-full">
          <CardTitle className="text-sm font-bold flex items-center justify-end gap-2 text-primary">
            {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
            مقارنة الطقس الميداني
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">
            {lastUpdated ? `آخر تحديث: ${lastUpdated}` : 'جاري المزامنة...'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* اختيار المدينة */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="h-10 rounded-xl border-primary/20 bg-muted/30 focus:ring-primary text-right flex-row-reverse">
                <SelectValue placeholder="اختر مدينتك" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
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

        {/* نسبة التوافق + الاتجاه */}
        <div className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", scoreBg)}>
          <div className="text-center">
            <span className={cn("text-3xl font-bold tracking-tighter", scoreColor)}>
              {isSyncing ? '--' : matchScore}%
            </span>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">نسبة التوافق</p>
          </div>
          {trend && !isSyncing && (
            <div className={cn("flex flex-col items-center gap-1", trend.color)}>
              <trend.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{trend.label}</span>
            </div>
          )}
        </div>

        {/* مقارنة الأرقام */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-black/5 text-center">
            <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">الحرارة الحية ({selectedCity})</p>
            <span className="text-xl font-bold">{isSyncing ? '--' : liveTemp}°م</span>
            {liveWindspeed !== null && !isSyncing && (
              <p className="text-[9px] text-muted-foreground mt-1">رياح: {liveWindspeed} كم/س</p>
            )}
          </div>
          <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-[8px] text-primary font-bold uppercase mb-1">المتوقع في التقويم</p>
            <p className="text-xl font-bold text-primary">{expectedTemp}°م</p>
            <p className="text-[9px] text-primary/60 mt-1">مرجع: الطائف</p>
          </div>
        </div>

        {/* تحليل الحزام + الإزاحة */}
        <div className={cn(
          "p-4 rounded-2xl flex items-start gap-3 text-right transition-all",
          currentZone.offset !== 0 ? "bg-orange-50 border border-orange-100" : "bg-primary/5 border border-primary/10"
        )}>
          {currentZone.offset !== 0
            ? <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
            : <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          }
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <p className="font-bold text-xs">{currentZone.name}</p>
              {currentZone.offset !== 0 && (
                <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-600 py-0 h-4">
                  إزاحة: {currentZone.offset > 0 ? `+${currentZone.offset}` : currentZone.offset} يوم
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{currentZone.advice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
