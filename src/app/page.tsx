
"use client";

import { useState, useEffect } from 'react';
import NawaaCard from '@/components/dashboard/NawaaCard';
import WeatherCompare from '@/components/dashboard/WeatherCompare';
import RecommendationList from '@/components/dashboard/RecommendationList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Helper to find current Nawaa based on Gregorian date accurately
function getCurrentNawaaInfo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Logic based on Ibn Umayra solar cycle
  // Al-Wasm starts Oct 16
  if (month === 10 && day >= 16) return { name: "الصرفة", season: "الوسم", day_in_nawaa: day - 15, progress: 60, notes: "انصراف الحر وبداية اعتدال الجو." };
  if (month === 10 && day >= 29) return { name: "العواء", season: "الوسم", day_in_nawaa: day - 28, progress: 15, notes: "بداية برودة الليل." };
  if (month === 11 && day <= 10) return { name: "العواء", season: "الوسم", day_in_nawaa: day + 2, progress: 70, notes: "بداية برودة الليل." };
  if (month === 11 && day >= 11 && day <= 23) return { name: "السماك (العطف)", season: "الوسم", day_in_nawaa: day - 10, progress: 50, notes: "كثرة الغيوم والأمطار الرعدية." };
  
  // Default for demo purposes if outside specific checks
  return {
    name: "السماك (العطف)",
    season: "الوسم",
    day_in_nawaa: 8,
    days_remaining: 5,
    progress_percent: 62,
    climate: {
      temperature: "معتدل يميل للبرودة ليلاً",
      wind: "شمالية شرقية خفيفة",
      rain: "احتمالية رذاذ صباحي",
      notes: "نجم العطف هو النجم الثالث من الوسم، فيه يعتدل النهار وتبرد الليالي، وهو وقت ذهبي للزراعة."
    }
  };
}

const recommendations = {
  planting: ["شتلات الطماطم", "الفلفل البارد", "البقدونس", "الخس"],
  activities: [
    "تسميد الأشجار المتساقطة الأوراق",
    "تعديل فترات الري لتقليل الهدر",
    "البدء بزراعة البقوليات الشتوية"
  ],
  warnings: [
    "تجنب الري الغزير في المساء لتفادي الفطريات",
    "راقب انخفاض درجات الحرارة المفاجئ فجراً"
  ]
};

export default function Home() {
  const [currentNawaa, setCurrentNawaa] = useState<any>(null);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  useEffect(() => {
    setCurrentNawaa(getCurrentNawaaInfo());
  }, []);

  return (
    <div className="min-h-screen text-right">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] flex items-center overflow-hidden">
        <Image
          src={heroImage?.imageUrl || ""}
          alt="Saudi Farm"
          fill
          className="object-cover z-0 brightness-50"
          priority
          data-ai-hint="saudi farm"
        />
        <div className="container mx-auto px-4 z-10 text-white space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-white/30">
            <MapPin className="h-4 w-4" />
            <span>المنطقة: الحجاز والمرتفعات</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight max-w-2xl">
            نزرع بالخبرة،<br /> وننمو بالذكاء الاصطناعي
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl font-medium">
            اكتشف أسرار تقويم ابن عميرة الزراعي في نسخته الرقمية المطورة لمزارعي المملكة.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8" asChild>
              <Link href="/ask">استشر المستشار الذكي <Sparkles className="mr-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
              <Link href="/calendar">استكشف التقويم الكامل</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="container mx-auto px-4 -mt-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-full">
            {currentNawaa && <NawaaCard nawaa={currentNawaa} />}
          </div>
          <div className="lg:col-span-4 h-full">
            <WeatherCompare />
          </div>
          <div className="lg:col-span-4 h-full">
            <RecommendationList recommendations={recommendations} />
          </div>
        </div>
      </section>

      {/* Featured Crops Section */}
      <section className="bg-muted/30 py-20 border-y">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-headline font-bold mb-2">محاصيل الموسم الحالية</h2>
              <p className="text-muted-foreground">أفضل المحاصيل المناسبة لمناخ منطقتك الآن</p>
            </div>
            <Button variant="link" className="text-primary font-bold group" asChild>
              <Link href="/crops">عرض كل المحاصيل <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['طماطم', 'خيار', 'فلفل', 'بقدونس'].map((crop, idx) => (
              <div key={crop} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={`https://picsum.photos/seed/crop${idx}/400/300`}
                    alt={crop}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint="fresh crop"
                  />
                  <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">موسم الزراعة</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{crop}</h3>
                  <p className="text-sm text-muted-foreground mb-4">وقت النضج المتوقع: ٩٠ يوم</p>
                  <Button variant="outline" size="sm" className="w-full">تفاصيل الزراعة</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Advisor Promotion */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent)]"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center p-8 md:p-16 relative z-10">
              <div className="text-white space-y-6">
                <h2 className="text-3xl md:text-5xl font-headline font-bold">المستشار الزراعي الذكي بجانبك دائماً</h2>
                <p className="text-lg text-white/80 leading-relaxed">
                  هل لديك سؤال عن نوع التربة؟ أو وقت التسميد؟ أو مرض أصاب محصولك؟ اسأل وكيلنا الذكي المتدرب على أسرار تقويم ابن عميرة وبيانات الزراعة الحديثة.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    </div>
                    <span>إجابات فورية باللغة العربية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    </div>
                    <span>نصائح مخصصة لموقعك الجغرافي</span>
                  </div>
                </div>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10" asChild>
                  <Link href="/ask">ابدأ المحادثة الآن</Link>
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">المساعد الذكي</p>
                      <p className="text-xs text-white/60">متصل الآن</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg rounded-tr-none ml-8">
                      <p className="text-sm text-white/90 leading-relaxed">أهلاً بك يا مزارعنا! كيف يمكنني مساعدتك اليوم بخصوص محصول الطماطم في منطقة الطائف؟</p>
                    </div>
                    <div className="bg-accent/20 p-4 rounded-lg rounded-tl-none mr-8 text-right">
                      <p className="text-sm text-white font-medium">متى أفضل وقت لنقل الشتلات للأرض؟</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg rounded-tr-none ml-8 border-r-2 border-accent">
                      <p className="text-sm text-white/90 leading-relaxed">بناءً على تقويم ابن عميرة، نحن الآن في نجم العطف، وهو الوقت المثالي لأن البرد قد انكسر والتربة دافئة بما يكفي للنمو الجيد.</p>
                    </div>
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
