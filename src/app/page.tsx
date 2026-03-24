
"use client";

import { useState, useEffect } from 'react';
import NawaaCard from '@/components/dashboard/NawaaCard';
import WeatherCompare from '@/components/dashboard/WeatherCompare';
import RecommendationList from '@/components/dashboard/RecommendationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// وظيفة لحساب النوء الحالي بناءً على التاريخ الفعلي لعام 2026
function getCurrentNawaaInfo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // حسب تقويم ابن عميرة: نجم السماك يبدأ في 21 مارس لمدة 13 يوماً
  if (month === 3 && day >= 21) {
    const dayInNawaa = day - 20;
    return {
      name: "السماك",
      season: "الحميمين",
      day_in_nawaa: dayInNawaa,
      days_remaining: 13 - dayInNawaa,
      progress_percent: Math.round((dayInNawaa / 13) * 100),
      startDate: "21 مارس",
      endDate: "2 أبريل",
      duration: 13,
      climate: {
        temperature: "20°م - معتدل",
        wind: "جنوبية شرقية",
        rain: "15% - غيوم عابرة",
        notes: "نحن الآن في نجم 'السماك'، أول نجوم الحميمين. يتساوى فيه الليل والنهار، وتبدأ الأرض بالدفء الفعلي، وهو وقت مثالي لغرس معظم الشتلات."
      }
    };
  }

  // Fallback (إعدادات افتراضية للسماك في حال كان التاريخ خارج النطاق للتجربة)
  return {
    name: "السماك",
    season: "الحميمين",
    day_in_nawaa: 4,
    days_remaining: 9,
    progress_percent: 30,
    startDate: "21 مارس",
    endDate: "2 أبريل",
    duration: 13,
    climate: {
      temperature: "19°م - ربيعي معتدل",
      wind: "هادئة",
      rain: "5% - جاف",
      notes: "نجم السماك: بداية فصل الحميمين، فيه يعتدل الجو وتورق الأشجار."
    }
  };
}

const currentRecommendations = {
  planting: ["البامية", "الكوسا", "الفلفل", "الباذنجان"],
  activities: ["بدء ري الأشجار المتساقطة", "تسميد أحواض الخضار"],
  warnings: ["مراقبة نشاط الحشرات الربيعية", "تجنب التعطيش المفاجئ"]
};

export default function Home() {
  const [currentNawaa, setCurrentNawaa] = useState<any>(null);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  useEffect(() => {
    setCurrentNawaa(getCurrentNawaaInfo());
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* Apple-style Minimal Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center space-y-6">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            مستقبل الزراعة السعودية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold apple-text-gradient leading-[1.1] tracking-tight">
            نزرع بالخبرة،<br /> وننمو بالذكاء.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            دمج تقويم ابن عميرة العريق مع أحدث تقنيات الذكاء الاصطناعي لمزرعة أكثر إنتاجية.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button size="lg" className="rounded-full px-8 bg-black hover:bg-black/90 text-white font-semibold" asChild>
              <Link href="/ask">ابدأ الاستشارة <Sparkles className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8 font-semibold group" asChild>
              <Link href="/calendar">استكشف التقويم <ChevronRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Image Box */}
      <section className="container mx-auto px-4 mb-24">
        <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-black/5">
          <Image
            src={heroImage?.imageUrl || ""}
            alt="Saudi Farm"
            fill
            className="object-cover"
            priority
            data-ai-hint="saudi farm landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Bento Grid Dashboard */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-5 flex">
            {currentNawaa && <NawaaCard nawaa={currentNawaa} />}
          </div>
          <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex">
                <WeatherCompare />
             </div>
             <div className="flex">
                <RecommendationList recommendations={currentRecommendations} />
             </div>
          </div>
        </div>
      </section>

      {/* Featured Crops */}
      <section className="bg-white py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-xl text-right mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">المحاصيل المثالية الآن</h2>
            <p className="text-lg text-muted-foreground">بناءً على موقعك ونجم "{currentNawaa?.name || 'السماك'}" الحالي، هذه هي أفضل الخيارات لمزرعتك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {['البامية', 'الكوسا', 'الباذنجان'].map((crop, idx) => (
              <div key={crop} className="group cursor-pointer">
                <div className="relative h-80 w-full mb-6 rounded-[2.5rem] overflow-hidden bg-muted">
                  <Image 
                    src={`https://picsum.photos/seed/applecrop${idx}/600/800`}
                    alt={crop}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint="fresh organic crop"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">{crop}</h3>
                <p className="text-muted-foreground font-medium">وقت الزراعة المثالي</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-32 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">المستشار الذكي.<br /><span className="text-white/40">ببساطة عبقري.</span></h2>
              <p className="text-xl text-white/60 leading-relaxed">
                حلول زراعية فورية مدعومة بذكاء اصطناعي يفهم تقاليدنا ويحلل بياناتنا الحية. اسأل عن أي شيء، وسنرد عليك بدقة مذهلة.
              </p>
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-10 font-bold" asChild>
                <Link href="/ask">جربه الآن</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="absolute -inset-20 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                <div className="space-y-6">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tr-none ml-12">
                    <p className="text-sm opacity-90 leading-relaxed">هل وقت زراعة البامية مناسب الآن في السماك؟</p>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl rounded-tl-none mr-12 shadow-lg">
                    <p className="text-sm font-medium">نعم، يعتبر السماك من أفضل الأوقات لزراعة البامية لدفء الأرض واعتدال الجو، وهو ما يضمن إنباتاً سريعاً.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
