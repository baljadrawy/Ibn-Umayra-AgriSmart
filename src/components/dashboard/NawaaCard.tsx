
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CloudRain, Wind, Thermometer } from 'lucide-react';

interface NawaaCardProps {
  nawaa: {
    name: string;
    season: string;
    day_in_nawaa: number;
    days_remaining: number;
    progress_percent: number;
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
    <Card className="overflow-hidden border-2 border-primary/20 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 border-primary text-primary font-bold">
              موسم {nawaa.season}
            </Badge>
            <CardTitle className="text-3xl font-headline font-bold text-primary">
              نجم {nawaa.name}
            </CardTitle>
          </div>
          <div className="text-left">
            <span className="text-4xl font-bold text-primary/40">#{nawaa.day_in_nawaa}</span>
            <p className="text-xs text-muted-foreground">اليوم في النوء</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">التقدم في النوء</span>
            <span className="text-muted-foreground">متبقي {nawaa.days_remaining} أيام</span>
          </div>
          <Progress value={nawaa.progress_percent} className="h-3 bg-secondary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Thermometer className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">الحرارة</p>
              <p className="font-semibold text-sm">{nawaa.climate.temperature}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Wind className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">الرياح</p>
              <p className="font-semibold text-sm">{nawaa.climate.wind}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <CloudRain className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-xs text-muted-foreground">الأمطار</p>
              <p className="font-semibold text-sm">{nawaa.climate.rain}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">التوقيت</p>
              <p className="font-semibold text-sm">مثالي للزراعة</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-accent/20 border border-accent/30">
          <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
            "{nawaa.climate.notes}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
