
"use client";

import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Droplets, Thermometer, Clock, Sprout, Star, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NAWAA_RECOMMENDATIONS, getAdjustedNawaaInfo, CLIMATE_ZONES_DATA, getFarmingScore, getFarmingScoreLabel } from '@/lib/location-data';

const cropsData = [
  { id: 1,  name: "طماطم",      category: "خضروات",  water: "متوسط",     temp: "20-30°م", time: "90 يوم",   imageId: "crop-tomato",   nawaaFit: ["الجبهة","الزبرة","العطف","المرزم"],   zones: ["highlands","west","east"] },
  { id: 2,  name: "فلفل رومي",  category: "خضروات",  water: "كثير",      temp: "22-32°م", time: "110 يوم",  imageId: "crop-pepper",   nawaaFit: ["العطف","السماك","السميك"],             zones: ["highlands","central","west"] },
  { id: 3,  name: "بقدونس",     category: "ورقيات",  water: "كثير",      temp: "15-25°م", time: "45 يوم",   imageId: "crop-parsley",  nawaaFit: ["الجبهة","الزبرة","العقرب"],           zones: ["all"] },
  { id: 4,  name: "برسيم",      category: "أعلاف",   water: "كثير جداً", temp: "10-35°م", time: "30 يوم",   imageId: "crop-alfalfa",  nawaaFit: ["الكف","العقيرب","السماك"],            zones: ["all"] },
  { id: 5,  name: "نخل",        category: "أشجار",   water: "متوسط",     temp: "25-45°م", time: "سنوات",    imageId: "crop-palm",     nawaaFit: ["الجوزاء","العطف","السماك"],           zones: ["central","east","west"] },
  { id: 6,  name: "عنب",        category: "فواكه",   water: "قليل",      temp: "18-35°م", time: "سنوات",    imageId: "crop-grapes",   nawaaFit: ["السماك","العطف","الزبرة"],            zones: ["highlands","north","central"] },
  { id: 7,  name: "خيار",       category: "خضروات",  water: "كثير",      temp: "22-32°م", time: "60 يوم",   imageId: "crop-tomato",   nawaaFit: ["الزبرة","العطف","العقرب"],            zones: ["all"] },
  { id: 8,  name: "بطيخ",       category: "فواكه",   water: "متوسط",     temp: "25-38°م", time: "80 يوم",   imageId: "crop-grapes",   nawaaFit: ["العقرب","العطف","الكف"],              zones: ["central","west","east"] },
  { id: 9,  name: "بامية",      category: "خضروات",  water: "متوسط",     temp: "25-35°م", time: "70 يوم",   imageId: "crop-pepper",   nawaaFit: ["العطف","السماك","الكف"],              zones: ["west","east","central"] },
  { id: 10, name: "ذرة حلوة",   category: "حبوب",    water: "كثير",      temp: "20-30°م", time: "90 يوم",   imageId: "crop-alfalfa",  nawaaFit: ["السماك","العطف","الزبرة"],            zones: ["all"] },
  { id: 11, name: "مانجو",      category: "فواكه",   water: "متوسط",     temp: "28-40°م", time: "سنوات",    imageId: "crop-grapes",   nawaaFit: ["الثريا","المجيدح","الكف"],            zones: ["west"] },
  { id: 12, name: "رمان",       category: "فواكه",   water: "قليل",      temp: "20-38°م", time: "سنوات",    imageId: "crop-grapes",   nawaaFit: ["العقيرب","الكف","السماك"],            zones: ["highlands","central","west"] },
];

const categories = ["الكل", "خضروات", "فواكه", "ورقيات", "أعلاف", "أشجار", "حبوب"];

export default function CropsGuide() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [currentNawaa, setCurrentNawaa] = useState<ReturnType<typeof getAdjustedNawaaInfo>>(null);
  const [userZoneId, setUserZoneId] = useState('highlands');

  useEffect(() => {
    const savedCity = localStorage.getItem('user_city');
    const { CLIMATE_ZONES_DATA } = require('@/lib/location-data');
    let zoneId = 'highlands';
    if (savedCity) {
      const zone = CLIMATE_ZONES_DATA.find((z: { cities: string[] }) => z.cities.includes(savedCity));
      if (zone) zoneId = zone.id;
    }
    setUserZoneId(zoneId);
    const zone = CLIMATE_ZONES_DATA.find((z: { id: string }) => z.id === zoneId) || CLIMATE_ZONES_DATA[0];
    setCurrentNawaa(getAdjustedNawaaInfo(zone.offset));
  }, []);

  const filteredCrops = cropsData.filter(c => {
    const matchSearch = c.name.includes(search);
    const matchCat = activeCategory === 'الكل' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const isCurrentSeason = (nawaaFit: string[]) =>
    currentNawaa ? nawaaFit.includes(currentNawaa.name) : false;

  const farmingScore = currentNawaa ? getFarmingScore(currentNawaa.name, userZoneId) : 50;
  const scoreLabel = getFarmingScoreLabel(farmingScore);

  return (
    <div className="container mx-auto px-4 py-24" dir="rtl">
      {/* الهيدر */}
      <div className="mb-10 space-y-3 text-right">
        <h1 className="text-4xl font-headline font-bold text-primary">دليل المحاصيل الزراعية</h1>
        <p className="text-muted-foreground text-lg">المحاصيل المناسبة لمناخ المملكة، مرتبطة بنجوم ابن عميرة الزراعي.</p>
      </div>

      {/* بانر النجم الحالي */}
      {currentNawaa && (
        <div className="mb-8 p-5 bg-primary/5 rounded-2xl border border-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-sm font-bold text-primary">نجم {currentNawaa.name} — دورة {currentNawaa.season}</p>
              <Star className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{currentNawaa.bestDays}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">مؤشر الزراعة</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-primary">{farmingScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <p className="text-xs font-bold">{scoreLabel}</p>
              <p className="text-[10px] text-muted-foreground">{currentNawaa.bestCropsSeason}</p>
            </div>
          </div>
        </div>
      )}

      {/* البحث والفلتر */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن محصول... (طماطم، نخل...)"
            className="pr-10 h-12 rounded-xl text-right"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="rounded-full text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* شبكة المحاصيل */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => {
          const imgData = PlaceHolderImages.find(img => img.id === crop.imageId);
          const inSeason = isCurrentSeason(crop.nawaaFit);
          return (
            <Card key={crop.id} className={`overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white ${inSeason ? 'ring-2 ring-primary/30' : ''}`}>
              <div className="relative h-48">
                <Image
                  src={imgData?.imageUrl || "https://picsum.photos/seed/default/600/400"}
                  alt={crop.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={imgData?.imageHint || "farm crop"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 text-right">
                  <Badge className="bg-accent text-accent-foreground font-bold mb-1 text-[10px]">{crop.category}</Badge>
                  <h2 className="text-xl font-bold text-white">{crop.name}</h2>
                </div>
                {inSeason && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 text-white text-[10px] font-bold flex items-center gap-1">
                      <Sprout className="h-3 w-3" /> الموسم الحالي
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="flex flex-col items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-[9px] text-muted-foreground">الري</span>
                    <span className="text-[11px] font-bold text-center">{crop.water}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-[9px] text-muted-foreground">الحرارة</span>
                    <span className="text-[11px] font-bold">{crop.temp}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[9px] text-muted-foreground">المدة</span>
                    <span className="text-[11px] font-bold">{crop.time}</span>
                  </div>
                </div>

                {/* النجوم المناسبة */}
                <div className="mb-4 text-right">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1.5">أنسب النجوم للزراعة</p>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {crop.nawaaFit.map(n => (
                      <Badge
                        key={n}
                        variant="outline"
                        className={`text-[9px] font-semibold ${currentNawaa?.name === n ? 'bg-primary text-white border-primary' : 'border-primary/20 text-primary/70'}`}
                      >
                        {n}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!inSeason && currentNawaa && (
                  <div className="flex items-center gap-1 mb-3 justify-end">
                    <p className="text-[10px] text-muted-foreground">غير مثالي في نجم {currentNawaa.name} الحالي</p>
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary rounded-xl text-xs h-9" asChild>
                    <Link href="/calendar">جدول الزراعة</Link>
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl text-xs h-9" asChild>
                    <Link href="/ask">استشر الذكاء</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground">لم نجد محاصيل تطابق بحثك. جرب كلمات أخرى.</p>
        </div>
      )}
    </div>
  );
}
