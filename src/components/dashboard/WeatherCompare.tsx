
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WeatherCompare() {
  const [matchScore, setMatchScore] = useState<number | null>(null);

  useEffect(() => {
    // Simulate hydration and logic delay
    setMatchScore(85);
  }, []);

  return (
    <Card className="h-full border-none shadow-md bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-headline font-bold">مقارنة الطقس الحي</CardTitle>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          تحديث تلقائي
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6 mb-4">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-accent">
            <div className="text-center">
              <span className="text-3xl font-bold">{matchScore ?? '--'}%</span>
              <p className="text-[10px] text-muted-foreground">نسبة التوافق</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm">توافق ممتاز مع توقعات تقويم ابن عميرة لهذا النوء.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-3 rounded-md bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">الحرارة الحالية</p>
              <p className="text-lg font-bold">24°م</p>
            </div>
            <div className="p-3 rounded-md bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">احتمال المطر</p>
              <p className="text-lg font-bold">15%</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-700">تنبيه: الرياح الشمالية قد تشتد مساءً، تأكد من حماية الشتلات الصغيرة.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
