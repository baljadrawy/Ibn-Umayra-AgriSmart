
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sprout, Hammer, AlertOctagon, MapPin, Thermometer } from 'lucide-react';

interface RecommendationListProps {
  recommendations: {
    planting: string[];
    activities: string[];
    warnings: string[];
  };
  city?: string;
  liveTemp?: number | null;
  expectedTemp?: number;
  zoneName?: string;
}

export default function RecommendationList({
  recommendations,
  city,
  liveTemp,
  expectedTemp,
  zoneName,
}: RecommendationListProps) {
  const hasData =
    recommendations.planting.length > 0 ||
    recommendations.activities.length > 0 ||
    recommendations.warnings.length > 0;

  const tempDiff = liveTemp != null && expectedTemp != null ? liveTemp - expectedTemp : null;

  return (
    <Card className="h-full border-none shadow-md bg-white flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-bold text-right leading-relaxed">توصيات اليوم</CardTitle>
          {city && (
            <Badge variant="outline" className="text-[9px] gap-1 border-primary/20 text-primary shrink-0">
              <MapPin className="h-2.5 w-2.5" />
              {city}
            </Badge>
          )}
        </div>
        {/* مؤشر الحرارة المقارن */}
        {tempDiff !== null && (
          <div className={`flex items-center gap-1.5 text-[10px] font-medium mt-1 ${
            Math.abs(tempDiff) <= 2 ? 'text-primary' :
            tempDiff > 0 ? 'text-orange-500' : 'text-blue-500'
          }`}>
            <Thermometer className="h-3 w-3" />
            {Math.abs(tempDiff) <= 2
              ? 'الطقس متوافق مع التقويم'
              : tempDiff > 0
                ? `الجو أحر بـ ${Math.round(tempDiff)}° — راجع توصيات الري`
                : `الجو أبرد بـ ${Math.abs(Math.round(tempDiff))}° — احمِ الشتلات الحساسة`
            }
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-5 overflow-y-auto">
        {!hasData ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-xs">
            جاري تحميل التوصيات...
          </div>
        ) : (
          <>
            {/* المحاصيل */}
            {recommendations.planting.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-primary font-bold mb-2 justify-end">
                  <span className="text-xs">المحاصيل المناسبة</span>
                  <Sprout className="h-4 w-4" />
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {recommendations.planting.map((crop) => (
                    <span key={crop} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* الأنشطة */}
            {recommendations.activities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 justify-end">
                  <span className="text-xs">الأنشطة الميدانية</span>
                  <Hammer className="h-4 w-4" />
                </div>
                <ul className="space-y-1.5">
                  {recommendations.activities.map((activity, idx) => (
                    <li key={idx} className="text-[11px] text-muted-foreground flex items-start gap-2 justify-end text-right">
                      <span>{activity}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* التنبيهات */}
            {recommendations.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-orange-600 font-bold mb-2 justify-end">
                  <span className="text-xs">تنبيهات ومخاطر</span>
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <ul className="space-y-1.5">
                  {recommendations.warnings.map((warning, idx) => (
                    <li key={idx} className="text-[11px] text-muted-foreground flex items-start gap-2 justify-end text-right">
                      <span>{warning}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* معلومة الحزام المناخي */}
            {zoneName && (
              <p className="text-[9px] text-muted-foreground/60 text-right border-t pt-3 mt-2">
                التوصيات معدّلة لـ {zoneName}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
