
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Hammer, AlertOctagon } from 'lucide-react';

interface RecommendationListProps {
  recommendations: {
    planting: string[];
    activities: string[];
    warnings: string[];
  };
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <Card className="h-full border-none shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-bold">توصيات اليوم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-3">
            <Sprout className="h-5 w-5" />
            <span className="text-sm">المحاصيل المناسبة للزراعة</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.planting.map((crop) => (
              <span key={crop} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {crop}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-3">
            <Hammer className="h-5 w-5" />
            <span className="text-sm">الأنشطة الميدانية</span>
          </div>
          <ul className="space-y-2">
            {recommendations.activities.map((activity, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                {activity}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 text-orange-600 font-bold mb-3">
            <AlertOctagon className="h-5 w-5" />
            <span className="text-sm">تنبيهات ومخاطر</span>
          </div>
          <ul className="space-y-2">
            {recommendations.warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
