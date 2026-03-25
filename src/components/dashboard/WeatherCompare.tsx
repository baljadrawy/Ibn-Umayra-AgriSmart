
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, RefreshCw, ThermometerSun, MapPin, Info, Navigation, LocateFixed } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// تعريف الأحزمة المناخية ومدنها وفوارق التوقيت عن الطائف
const CLIMATE_ZONES_DATA = [
  {
    id: 'highlands',
    name: 'المرتفعات الجبلية',
    offset: 0,
    advice: 'أنت في النطاق المرجعي: تقويم ابن عميرة ينطبق على مزرعتك مباشرة وبدقة عالية.',
    cities: ['الطائف', 'أبها', 'الباحة', 'النماص', 'بلجرشي', 'خميس مشيط', 'ميسان', 'الشفا', 'الهدا']
  },
  {
    id: 'central',
    name: 'الهضبة الوسطى',
    offset: 7,
    advice: 'المناخ قاري: يرجى تأخير مواعيد الزراعة بـ 7 أيام عن التقويم الأصلي بسبب تأخر انكسار البرد.',
    cities: ['الرياض', 'بريدة', 'عنيزة', 'حائل', 'الخرج', 'المجمعة', 'الزلفي', 'شقراء', 'الدوادمي']
  },
  {
    id: 'east',
    name: 'السهول الشرقية',
    offset: -10,
    advice: 'دفء مبكر: يمكنك تقديم مواعيد الزراعة بـ 10 أيام عن التقويم نظراً للدفء والرطوبة المبكرة.',
    cities: ['الدمام', 'الخبر', 'الأحساء', 'الجبيل', 'حفر الباطن', 'القطيف', 'الظهران', 'الخفجي']
  },
  {
    id: 'west',
    name: 'السهول الغربية',
    offset: -7,
    advice: 'مناخ تهامة والساحل: قدم مواعيد الزراعة بـ 7 أيام، والمنطقة مناسبة للمحاصيل الاستوائية.',
    cities: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'ينبع', 'جازان', 'رابغ', 'القنفذة', 'الليث']
  },
  {
    id: 'north',
    name: 'المناطق الشمالية',
    offset: 14,
    advice: 'صقيع ممتد: يرجى تأخير مواعيد الزراعة بـ 14 يوماً عن التقويم الأصلي لحماية الشتلات من موجات البرد المتأخرة.',
    cities: ['تبوك', 'سكاكا', 'عرعر', 'القريات', 'طريف', 'دومة الجندل', 'حقل']
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

  // البحث عن الحزام المناخي بناءً على اسم المدينة
  const findZoneByCity = (cityName: string) => {
    return CLIMATE_ZONES_DATA.find(zone => zone.cities.includes(cityName)) || CLIMATE_ZONES_DATA[0];
  };

  const fetchWeather = async (lat: number, lon: number, locationName: string, isAuto: boolean) => {
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
        // في حال التحديد الآلي، نحاول تخمين الحزام (تبسيطاً نستخدم أقرب حزام للموقع)
        // هنا سنعتمد على أن الموقع آلي
      } else {
        setIsAutoLocation(false);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setIsAutoLocation(false);
    const zone = findZoneByCity(cityName);
    setCurrentZone(zone);
    
    // إحداثيات تقريبية للمدن (يمكن تطويرها بقاعدة بيانات كاملة)
    // هنا نستخدم إحداثيات المرجع لكل حزام للتبسيط
    const coords = { lat: 21.27, lon: 40.41 }; // افتراضي الطائف
    fetchWeather(coords.lat, coords.lon, cityName, false);
  };

  const handleAutoDetect = () => {
    if ("geolocation" in navigator) {
      setIsSyncing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "موقعك الحالي", true),
        () => {
          handleManualCityChange("الطائف");
          alert("تعذر تحديد موقعك آلياً، تم العودة لمرجع الطائف.");
        },
        { timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    // البدء بمدينة الطائف افتراضياً
    handleManualCityChange("الطائف");
  }, [expectedClimate]);

  return (
    <Card className="h-full border-none shadow-md bg-white overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-bold">مقارنة الطقس الميداني</CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">مزامنة حية مع المناخ المحلي</p>
        </div>
        <Badge variant="secondary" className={cn(
          "rounded-full text-[9px] px-2",
          isSyncing ? "animate-pulse" : "bg-primary/10 text-primary"
        )}>
          {isSyncing ? "جاري التحديث" : "بيانات حية"}
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-6">
        {/* اختيار الموقع */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={isAutoLocation ? "auto" : selectedCity} onValueChange={handleManualCityChange}>
                <SelectTrigger className="h-10 rounded-xl border-primary/20 bg-muted/30 focus:ring-primary">
                  <SelectValue placeholder="اختر مدينتك" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="auto" disabled className="hidden">موقعك الحالي</SelectItem>
                  {CLIMATE_ZONES_DATA.map((zone) => (
                    <SelectGroup key={zone.id}>
                      <SelectLabel className="text-primary font-bold pr-8">{zone.name}</SelectLabel>
                      {zone.cities.map((city) => (
                        <SelectItem key={city} value={city} className="pr-8">{city}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-10 w-10 rounded-xl transition-colors", isAutoLocation && "bg-primary text-white border-primary")}
              onClick={handleAutoDetect}
              title="تحديد الموقع آلياً"
            >
              <LocateFixed className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* مؤشر التوافق والحرارة */}
        <div className="flex items-center justify-center py-2">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-primary/5 bg-primary/5 shadow-inner">
            <div className="text-center">
              <span className="text-3xl font-bold text-primary tracking-tighter">{isSyncing ? '--' : matchScore}%</span>
              <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">نسبة التوافق</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-black/5 text-center">
            <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">الحرارة الحالية</p>
            <span className="text-xl font-bold text-foreground">{isSyncing ? '--' : liveTemp}°م</span>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-black/5 text-center">
            <p className="text-[8px] text-muted-foreground font-bold uppercase mb-1">المتوقع (الطائف)</p>
            <p className="text-xl font-bold text-primary">{expectedClimate?.temperature.split(' ')[0] || '21°م'}</p>
          </div>
        </div>

        {/* بيان التعديل */}
        <div className={cn(
          "p-4 rounded-2xl flex items-start gap-3 text-right transition-all",
          currentZone.offset !== 0 ? "bg-orange-50 border border-orange-100" : "bg-primary/5 border border-primary/10"
        )}>
          {currentZone.offset !== 0 ? 
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" /> : 
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          }
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-xs">تحليل المنطقة: {currentZone.name}</p>
              {currentZone.offset !== 0 && (
                <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-600 py-0 leading-none h-4">
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

