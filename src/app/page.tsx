
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

// Function to calculate the current Nawaa based on the date
function getCurrentNawaaInfo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Logic for late March (Hameem season - Sa'd al-Akhbiya)
  if (month === 3 && day >= 21) {
    return {
      name: "سعد الأخبية",
      season: "الحميمين",
      day_in_nawaa: day - 20,
      days_remaining: 13 - (day - 21),
      progress_percent: Math.round(((day - 21) / 13) * 100),
      climate: {
        temperature: "19°C - ربيعي معتدل",
        wind: "جنوبية شرقية",
        rain: "10% - غائم جزئياً",
        notes: "بداية فصل الحميمين، يخرج الهوام من مخابئه لدفء الأرض، والجو يميل للاعتدال اللطيف."
      }
    };
  }

  // Fallback to a default (if date calculation is complex for this demo)
  return {
    name: "سعد الأخبية",
    season: "الحميمين",
    day_in_nawaa: 4,
    days_remaining: 9,
    progress_percent: 30,
    climate: {
      temperature: "19°C - معتدل بارد",
      wind: "جنوبية نشطة",
      rain: "5% - جاف",
      notes: "نحن الآن في موسم الحميمين، الأجواء لطيفة نهاراً وتميل للبرودة ليلاً."
    }
  };
}

const recommendations = {
  planting: ["القرع", "الكوسا", "البامية"],
  activities: ["تجهيز شبكات الري", "مكافحة آفات الربيع"],
  warnings: ["تذبذب درجات الحرارة بين الليل والنهار"]
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

      {/* Hero Image / Video Box */}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          <div className="md:col-span-5 h-full">
            {currentNawaa && <NawaaCard nawaa={currentNawaa} />}
          </div>
          <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
             <div className="h-full">
                <WeatherCompare />
             </div>
             <div className="h-full">
                <RecommendationList recommendations={recommendations} />
             </div>
          </div>
        </div>
      </section>

      {/* Content Section: Featured Crops */}
      <section className="bg-white py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-xl text-right mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">المحاصيل المثالية الآن</h2>
            <p className="text-lg text-muted-foreground">بناءً على موقعك ونجم "سعد الأخبية" الحالي، هذه هي أفضل الخيارات لمزرعتك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {['البامية', 'الكوسا', 'القرع'].map((crop, idx) => (
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

      {/* AI Section with Apple feel */}
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
                    <p className="text-sm opacity-90 leading-relaxed">كيف أحمي النخل من السوسة في هذا الوقت؟</p>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl rounded-tl-none mr-12 shadow-lg">
                    <p className="text-sm font-medium">بناءً على نجم سعد الأخبية، الرطوبة مناسبة لبدء المكافحة الوقائية الآن قبل اشتداد الحرارة.</p>
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
