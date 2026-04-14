
import { Calendar, Clock, CloudRain, Thermometer, Wind, Sprout, Star } from 'lucide-react';

interface NawaaCardProps {
  nawaa: {
    name: string;
    season: string;
    day_in_nawaa: number;
    days_remaining: number;
    progress_percent: number;
    startDate: string;
    endDate: string;
    startHijri?: string;
    endHijri?: string;
    duration: number;
    bestDays?: string;
    farmingScore?: number;
    bestCropsSeason?: string;
    climate: {
      temperature: string;
      wind: string;
      rain: string;
      notes: string;
    };
  };
}

function FarmingScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-yellow-400' :
    score >= 35 ? 'bg-orange-400' :
    'bg-red-400';
  const label =
    score >= 80 ? '🟢 ممتاز' :
    score >= 60 ? '🟡 جيد' :
    score >= 35 ? '🟠 متوسط' :
    '🔴 ضعيف';
  return (
    <div className="space-y-1.5 p-3 bg-muted/40 rounded-2xl border border-black/5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-primary">{label} — {score}/100</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-[9px] font-bold uppercase">ملاءمة الزراعة</span>
          <Sprout className="h-3 w-3" />
        </div>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700 ease-out`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function NawaaCard({ nawaa }: NawaaCardProps) {
  return (
    <div className="bento-card p-8 flex flex-col justify-between w-full group bg-white border-primary/10">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1 text-right">
            <p className="text-primary font-bold text-xs tracking-widest uppercase">دورة {nawaa.season}</p>
            <h2 className="text-5xl font-bold tracking-tighter">نجم {nawaa.name}</h2>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
        </div>

        {/* التواريخ: ميلادي + هجري */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-2xl border border-black/5 text-right space-y-1">
            <p className="text-[9px] text-muted-foreground font-bold uppercase">دخول النجم</p>
            <p className="text-sm font-bold">{nawaa.startDate}</p>
            {nawaa.startHijri && (
              <p className="text-[10px] text-primary/60 font-medium">{nawaa.startHijri}</p>
            )}
          </div>
          <div className="p-4 bg-muted/50 rounded-2xl border border-black/5 text-right space-y-1">
            <p className="text-[9px] text-muted-foreground font-bold uppercase">خروج النجم</p>
            <p className="text-sm font-bold">{nawaa.endDate}</p>
            {nawaa.endHijri && (
              <p className="text-[10px] text-primary/60 font-medium">{nawaa.endHijri}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-right">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-[10px] font-bold">الحرارة المتوقعة</span>
              <Thermometer className="h-3 w-3" />
            </div>
            <p className="text-lg font-bold">{nawaa.climate.temperature}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-[10px] font-bold">الرياح</span>
              <Wind className="h-3 w-3" />
            </div>
            <p className="text-lg font-bold">{nawaa.climate.wind}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-[10px] font-bold">الأمطار</span>
              <CloudRain className="h-3 w-3" />
            </div>
            <p className="text-lg font-bold">{nawaa.climate.rain}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-[10px] font-bold">اليوم الحالي</span>
              <Clock className="h-3 w-3" />
            </div>
            <p className="text-lg font-bold">يوم {nawaa.day_in_nawaa} / {nawaa.duration}</p>
          </div>
        </div>

        {/* مؤشر ملاءمة الزراعة */}
        {nawaa.farmingScore !== undefined && (
          <div className="mb-5">
            <FarmingScoreBar score={nawaa.farmingScore} />
          </div>
        )}

        {/* أفضل أيام الزراعة */}
        {nawaa.bestDays && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/10 mb-5 text-right">
            <div className="flex-1">
              <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">أفضل أيام الزراعة</p>
              <p className="text-xs font-semibold text-primary">{nawaa.bestDays}</p>
            </div>
            <Star className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>{nawaa.progress_percent}% مكتمل</span>
            <span>متبقي {nawaa.days_remaining} يوم</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${nawaa.progress_percent}%` }}
            ></div>
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic text-right border-r-2 border-primary/20 pr-3">
          "{nawaa.climate.notes}"
        </p>
      </div>
    </div>
  );
}
