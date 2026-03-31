
"use client";

import { useState, useEffect, useCallback } from 'react';
import NawaaCard from '@/components/dashboard/NawaaCard';
import WeatherCompare from '@/components/dashboard/WeatherCompare';
import RecommendationList from '@/components/dashboard/RecommendationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight, AlertCircle, Info, Navigation, LocateFixed, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLIMATE_ZONES_DATA, NAWAA_RECOMMENDATIONS, getNearestCity, getAdjustedNawaaInfo } from '@/lib/location-data';

export default function Home() {
  const [currentNawaa, setCurrentNawaa] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCity, setOnboardingCity] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [activeCity, setActiveCity] = useState<string>('');
  const [activeLiveTemp, setActiveLiveTemp] = useState<number | null>(null);
  const [activeZoneName, setActiveZoneName] = useState<string>('');
  const [recommendations, setRecommendations] = useState<{planting: string[], activities: string[], warnings: string[]}>({
    planting: [],
    activities: [],
    warnings: []
  });

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  const updateDynamicData = useCallback((cityName: string, liveTemp: number, zoneId: string) => {
    const zone = CLIMATE_ZONES_DATA.find(z => z.id === zoneId) || CLIMATE_ZONES_DATA[0];
    const nawaa = getAdjustedNawaaInfo(zone.offset);
    setCurrentNawaa(nawaa);
    setActiveCity(cityName);
    setActiveLiveTemp(liveTemp);
    setActiveZoneName(zone.name);

    if (nawaa) {
      const baseRecs = JSON.parse(JSON.stringify(NAWAA_RECOMMENDATIONS[nawaa.name] || { planting: [], activities: [], warnings: [] }));

      const adjustedWarnings = [...baseRecs.warnings];
      const expectedTemp = nawaa.climate?.expectedTemp ?? 21;
      if (liveTemp > expectedTemp + 5) {
        adjustedWarnings.push("الحرارة أعلى من المعتاد: كثّف الري المسائي");
      } else if (liveTemp < expectedTemp - 5) {
        adjustedWarnings.push("برد مفاجئ: احمِ الشتلات الحساسة من التيارات الباردة");
      }

      // إضافة المحاصيل الاستوائية للمنطقة الغربية فقط إذا لم تكن موجودة مسبقاً في القائمة
      if (zoneId === 'west') {
        const tropicalCrops = ["المانجو", "البابايا"];
        tropicalCrops.forEach(crop => {
          if (!baseRecs.planting.includes(crop)) {
            baseRecs.planting.push(crop);
          }
        });
      }

      setRecommendations({
        ...baseRecs,
        warnings: adjustedWarnings
      });
    }
  }, []);

  useEffect(() => {
    // Initial Nawaa set based on local storage if available
    const savedCity = localStorage.getItem('user_city');
    if (!savedCity) {
      setCurrentNawaa(getAdjustedNawaaInfo(0));
      setTimeout(() => setShowOnboarding(true), 1500);
    } else {
      const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(savedCity)) || CLIMATE_ZONES_DATA[0];
      setCurrentNawaa(getAdjustedNawaaInfo(zone.offset));
    }
  }, []);

  const handleOnboardingManual = () => {
    if (onboardingCity) {
      localStorage.setItem('user_city', onboardingCity);
      localStorage.removeItem('user_is_auto');
      setShowOnboarding(false);
      // تحديث الـ state مباشرة بدلاً من إعادة التحميل
      const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(onboardingCity)) || CLIMATE_ZONES_DATA[0];
      setCurrentNawaa(getAdjustedNawaaInfo(zone.offset));
    }
  };

  const handleOnboardingAuto = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("المتصفح لا يدعم تحديد الموقع. الرجاء الاختيار اليدوي.");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearestCity = getNearestCity(pos.coords.latitude, pos.coords.longitude);
        localStorage.setItem('user_city', nearestCity);
        localStorage.setItem('user_lat', pos.coords.latitude.toString());
        localStorage.setItem('user_lon', pos.coords.longitude.toString());
        localStorage.setItem('user_is_auto', 'true');
        setIsLocating(false);
        setShowOnboarding(false);
        // تحديث الـ state مباشرة
        const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(nearestCity)) || CLIMATE_ZONES_DATA[0];
        setCurrentNawaa(getAdjustedNawaaInfo(zone.offset));
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("تم رفض إذن الموقع. الرجاء الاختيار اليدوي من القائمة.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("تعذّر تحديد موقعك. الرجاء الاختيار اليدوي.");
        } else {
          setLocationError("انتهت مهلة تحديد الموقع. الرجاء المحاولة مجدداً.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent/10 py-2 border-b border-accent/20">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-primary">
          <AlertCircle className="h-3 w-3" />
          <span>إطلاق تجريبي: التقويم الزراعي المطور - البيانات محدثة زمنياً ومكانياً</span>
        </div>
      </div>

      <section className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto text-center space-y-6">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 w-fit mx-auto">
            <Navigation className="h-3 w-3" />
            النظام يدعم التحديد الآلي واليدوي لكافة مناطق المملكة
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold apple-text-gradient leading-[1.1] tracking-tight text-right md:text-center">
            التقويم الزراعي المطور <br />
            <span className="text-primary">بناءً على تقويم ابن عميرة</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium text-right md:text-center">
            بوابة ذكية تدمج الخبرة التاريخية للمملكة مع أحدث تقنيات الرصد والذكاء الاصطناعي.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg" asChild>
              <Link href="/ask">استشر الذكاء الزراعي <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8 font-semibold group" asChild>
              <Link href="/calendar">استكشف التقويم الكامل <ChevronRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="relative h-[250px] md:h-[400px] rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
          <Image
            src={heroImage?.imageUrl || ""}
            alt="Saudi Farm"
            fill
            className="object-cover"
            priority
            data-ai-hint="saudi farm landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 right-8 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-accent" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">تنبيه ذكي</p>
            </div>
            <p className="text-sm md:text-base font-medium max-w-md">اختر مدينتك من قائمة "مقارنة الطقس" ليقوم النظام بحساب التعديل الزمني المناسب لك.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-5 flex">
            {currentNawaa && <NawaaCard nawaa={currentNawaa} />}
          </div>
          <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex">
                <WeatherCompare 
                  expectedClimate={currentNawaa?.climate} 
                  onLocationUpdate={updateDynamicData}
                />
             </div>
             <div className="flex">
                <RecommendationList
                  recommendations={recommendations}
                  city={activeCity || undefined}
                  liveTemp={activeLiveTemp}
                  expectedTemp={currentNawaa?.climate?.expectedTemp}
                  zoneName={activeZoneName || undefined}
                />
             </div>
          </div>
        </div>
      </section>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[425px] text-right rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 justify-end">
              أهلاً بك في التقويم المطور
              <Sparkles className="h-6 w-6 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-right pt-2 leading-relaxed">
              لتقديم أدق النصائح الزراعية وتعديل مواعيد التقويم حسب منطقتك، يرجى تحديد موقعك الحالي.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground pr-1 uppercase">الخيار الأول: تحديد آلي</p>
              <Button
                onClick={handleOnboardingAuto}
                variant="outline"
                disabled={isLocating}
                className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5 gap-3 text-lg"
              >
                {isLocating
                  ? <><Loader2 className="h-5 w-5 text-primary animate-spin" /> جاري تحديد موقعك...</>
                  : <><LocateFixed className="h-5 w-5 text-primary" /> تحديد موقعي آلياً</>
                }
              </Button>
              {locationError && (
                <p className="text-xs text-destructive text-right pr-1">{locationError}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold">أو</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground pr-1 uppercase">الخيار الثاني: اختيار يدوي</p>
              <Select onValueChange={setOnboardingCity} value={onboardingCity}>
                <SelectTrigger className="h-14 rounded-2xl border-primary/20 text-right flex-row-reverse">
                  <SelectValue placeholder="اختر مدينتك أو محافظتك" />
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
          </div>

          <DialogFooter>
            <Button 
              onClick={handleOnboardingManual} 
              disabled={!onboardingCity}
              className="w-full h-12 bg-primary rounded-xl font-bold text-lg"
            >
              تأكيد الاختيار وحفظ الموقع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
