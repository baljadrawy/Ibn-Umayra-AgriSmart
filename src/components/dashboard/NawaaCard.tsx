
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Wind, Thermometer, Calendar, Clock } from 'lucide-react';

interface NawaaCardProps {
  nawaa: {
    name: string;
    season: string;
    day_in_nawaa: number;
    days_remaining: number;
    progress_percent: number;
    startDate: string;
    endDate: string;
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
    <div className="bento-card p-8 flex flex-col justify-between h-full group bg-white">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <p className="text-primary font-bold text-sm tracking-widest uppercase">موسم {nawaa.season}</p>
            <h2 className="text-5xl font-bold tracking-tighter">نجم {nawaa.name}</h2>
          </div>
          <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Start and End Dates - Apple Style */}
        <div className="flex items-center gap-4 mb-10 p-4 bg-muted/30 rounded-2xl border border-black/5">
          <div className="flex-1 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">من تاريخ</p>
            <p className="text-sm font-bold">{nawaa.startDate}</p>
          </div>
          <div className="h-8 w-px bg-black/10" />
          <div className="flex-1 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">إلى تاريخ</p>
            <p className="text-sm font-bold">{nawaa.endDate}</p>
          </div>
          <div className="h-8 w-px bg-black/10" />
          <div className="flex-1 text-right">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">المدة</p>
            <p className="text-sm font-bold">13 يوماً</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs font-semibold">الحرارة</span>
            </div>
            <p className="text-xl font-bold">{nawaa.climate.temperature}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span className="text-xs font-semibold">الرياح</span>
            </div>
            <p className="text-xl font-bold">{nawaa.climate.wind}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CloudRain className="h-4 w-4" />
              <span className="text-xs font-semibold">الأمطار</span>
            </div>
            <p className="text-xl font-bold">{nawaa.climate.rain}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold">اليوم الحالي</span>
            </div>
            <p className="text-xl font-bold"># {nawaa.day_in_nawaa}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>متبقي {nawaa.days_remaining} أيام</span>
            <span>{nawaa.progress_percent}% مكتمل</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
             <div 
               className="h-full bg-primary transition-all duration-1000 ease-out" 
               style={{ width: `${nawaa.progress_percent}%` }}
             ></div>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          {nawaa.climate.notes}
        </p>
      </div>
    </div>
  );
}
