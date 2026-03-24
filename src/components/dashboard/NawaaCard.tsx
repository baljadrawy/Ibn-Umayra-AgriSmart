
import { Calendar, Clock, CloudRain, Thermometer, Wind } from 'lucide-react';

interface NawaaCardProps {
  nawaa: {
    name: string;
    season: string;
    day_in_nawaa: number;
    days_remaining: number;
    progress_percent: number;
    startDate: string;
    endDate: string;
    hijriStart: string;
    hijriEnd: string;
    duration: number;
    climate: {
      temperature: string;
      wind: string;
      rain: string;
      notes: string;
    };
  };
}

export default function NawaaCard({ nawaa }: NawaaCardProps) {
  return (
    <div className="bento-card p-8 flex flex-col justify-between w-full group bg-white">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1 text-right">
            <p className="text-primary font-bold text-sm tracking-widest uppercase">دورة {nawaa.season}</p>
            <h2 className="text-5xl font-bold tracking-tighter">نجم {nawaa.name}</h2>
          </div>
          <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Start, End Dates, and Duration - Apple Style */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-muted/30 rounded-2xl border border-black/5 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">دخول النجم</p>
            <p className="text-sm font-bold">{nawaa.startDate}</p>
            <p className="text-[10px] text-primary">{nawaa.hijriStart}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-2xl border border-black/5 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">خروج النجم</p>
            <p className="text-sm font-bold">{nawaa.endDate}</p>
            <p className="text-[10px] text-primary">{nawaa.hijriEnd}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10 text-right">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-xs font-semibold">الحرارة المتوقعة</span>
              <Thermometer className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{nawaa.climate.temperature}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-xs font-semibold">الرياح</span>
              <Wind className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{nawaa.climate.wind}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-xs font-semibold">الأمطار</span>
              <CloudRain className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{nawaa.climate.rain}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span className="text-xs font-semibold">اليوم الحالي</span>
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">يوم # {nawaa.day_in_nawaa}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>{nawaa.progress_percent}% مكتمل</span>
            <span>متبقي {nawaa.days_remaining} أيام</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-primary transition-all duration-1000 ease-out" 
               style={{ width: `${nawaa.progress_percent}%` }}
             ></div>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed italic text-right">
          "{nawaa.climate.notes}"
        </p>
      </div>
    </div>
  );
}
