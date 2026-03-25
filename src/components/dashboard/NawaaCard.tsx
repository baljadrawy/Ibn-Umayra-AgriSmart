
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

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-muted/50 rounded-2xl border border-black/5 text-right">
            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">دخول النجم (ميلادي)</p>
            <p className="text-sm font-bold">{nawaa.startDate}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-2xl border border-black/5 text-right">
            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">خروج النجم (ميلادي)</p>
            <p className="text-sm font-bold">{nawaa.endDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10 text-right">
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
            <p className="text-lg font-bold">يوم # {nawaa.day_in_nawaa}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
            <span>{nawaa.progress_percent}% مكتمل</span>
            <span>متبقي {nawaa.days_remaining} أيام</span>
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
