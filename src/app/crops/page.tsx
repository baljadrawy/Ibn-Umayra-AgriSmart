
"use client";

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Droplets, Thermometer, Clock } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const cropsData = [
  { id: 1, name: "طماطم", category: "خضروات", water: "متوسط", temp: "20-30°م", time: "90 يوم", imageId: "crop-tomato" },
  { id: 2, name: "فلفل رومي", category: "خضروات", water: "كثير", temp: "22-32°م", time: "110 يوم", imageId: "crop-pepper" },
  { id: 3, name: "بقدونس", category: "ورقيات", water: "كثير", temp: "15-25°م", time: "45 يوم", imageId: "crop-parsley" },
  { id: 4, name: "برسيم", category: "أعلاف", water: "كثير جداً", temp: "10-35°م", time: "30 يوم", imageId: "crop-alfalfa" },
  { id: 5, name: "نخل", category: "أشجار", water: "متوسط", temp: "25-45°م", time: "سنوات", imageId: "crop-palm" },
  { id: 6, name: "عنب", category: "فواكه", water: "قليل", temp: "18-35°م", time: "سنوات", imageId: "crop-grapes" },
];

export default function CropsGuide() {
  const [search, setSearch] = useState('');

  const filteredCrops = cropsData.filter(c => c.name.includes(search));

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-12 space-y-4 text-right">
        <h1 className="text-4xl font-headline font-bold text-primary">دليل المحاصيل والزراعة</h1>
        <p className="text-muted-foreground text-lg">تعرف على أفضل المحاصيل المناسبة لمناخ المملكة وتوقيت زراعتها المثالي.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن محصول... (مثلاً: طماطم، نخل)" 
              className="pr-10 h-12 rounded-xl text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 gap-2 rounded-xl">
            <Filter className="h-5 w-5" />
            تصفية المجموعات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCrops.map((crop) => {
          const imgData = PlaceHolderImages.find(img => img.id === crop.imageId);
          return (
            <Card key={crop.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
              <div className="relative h-56">
                <Image 
                  src={imgData?.imageUrl || "https://picsum.photos/seed/default/600/400"} 
                  alt={crop.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={imgData?.imageHint || "fresh vegetable"}
                />
                <div className="absolute bottom-0 right-0 left-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-right">
                  <Badge className="bg-accent text-accent-foreground font-bold mb-2">{crop.category}</Badge>
                  <h2 className="text-2xl font-bold text-white">{crop.name}</h2>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] text-muted-foreground">الري</span>
                    <span className="text-xs font-bold">{crop.water}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] text-muted-foreground">الحرارة</span>
                    <span className="text-xs font-bold">{crop.temp}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[10px] text-muted-foreground">المدة</span>
                    <span className="text-xs font-bold">{crop.time}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary rounded-xl">جدول الزراعة</Button>
                  <Button variant="outline" className="flex-1 rounded-xl">استشر الذكاء</Button>
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
