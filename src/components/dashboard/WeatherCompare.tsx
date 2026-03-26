
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, LocateFixed, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CLIMATE_ZONES_DATA, CITIES_COORDINATES, getNearestCity } from '@/lib/location-data';

interface WeatherCompareProps {
  expectedClimate?: {
    temperature: string;
    notes: string;
  };
  onLocationUpdate?: (city: string, temp: number, zoneId: string) => void;
}

export default function WeatherCompare({ expectedClimate, onLocationUpdate }: WeatherCompareProps) {
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
      
      // إذا كان التحديد آلياً، نحاول اكتشاف اسم المدينة من الإحداثيات
      let finalCityName = locationName;
      if (isAuto) {
        finalCityName = getNearestCity(lat, lon);
      }

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

  const handleCityChange = (cityName: string) => {
    if (cityName === "auto") {
      handleAutoDetect();
      return;
    }

    setSelectedCity(cityName);
    setIsAutoLocation(false);
    
    const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(cityName)) || CLIMATE_ZONES_DATA[0];
    setCurrentZone(zone);
    
    const coords = CITIES_COORDINATES[cityName] || CITIES_COORDINATES['الطائف'];
    fetchWeather(coords.lat, coords.lon, cityName, false);
  };

  const handleAutoDetect = () => {
    if ("geolocation" in navigator) {
      setIsSyncing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "جاري التعرف...", true),
        () => {
          handleCityChange("الطائف");
        },
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

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1 text-right w-full">
          <CardTitle className="text-sm font-bold flex items-center justify-end gap-2 text-primary">
            {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
            مقارنة الطقس الميداني
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">مزامنة آليّة لموقعك الحالي</p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-6">
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
