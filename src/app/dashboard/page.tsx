
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Database, Cpu, Settings, Globe, ShieldCheck, Zap, Activity, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ControlPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("منذ دقيقتين");
  const [sources, setSources] = useState({
    weather: true,
    agriDb: true,
    iotSensors: false,
    satellite: false,
  });

  const toggleSource = (key: keyof typeof sources) => {
    setSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSync("الآن");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <Settings className="h-8 w-8" />
            لوحة تحكم الربط الذكي
          </h1>
          <p className="text-muted-foreground mt-2">إدارة القراءات الميدانية ومصادر البيانات المحلية وتحديث التقويم.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 border-primary text-primary bg-primary/5 flex gap-2 rounded-full">
          <Zap className="h-3 w-3" />
          النظام متصل ويعمل
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-right">
        <Card className="bento-card border-none bg-primary text-primary-foreground p-2">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/70">المصادر النشطة</CardDescription>
            <CardTitle className="text-4xl">2 / 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 mt-4">
              <div className="h-1 flex-1 bg-white/40 rounded"></div>
              <div className="h-1 flex-1 bg-white/40 rounded"></div>
              <div className="h-1 flex-1 bg-white/10 rounded"></div>
              <div className="h-1 flex-1 bg-white/10 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card border-none p-2">
          <CardHeader className="pb-2">
            <CardDescription>موثوقية البيانات</CardDescription>
            <CardTitle className="text-4xl">98%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-none rounded-full">قراءة ميدانية</Badge>
          </CardContent>
        </Card>
        <Card className="bento-card border-none p-2">
          <CardHeader className="pb-2">
            <CardDescription>آخر قراءة مدخلة</CardDescription>
            <CardTitle className="text-xl">{lastSync}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-full border-primary text-primary hover:bg-primary/5"
              onClick={handleManualSync}
              disabled={isRefreshing}
            >
              {isRefreshing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
              {isRefreshing ? "جاري التحديث..." : "تحديث القراءة"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Source 1 */}
        <Card className="bento-card border-none overflow-hidden group p-2">
          <div className={cn("h-1.5 transition-colors duration-500", sources.weather ? 'bg-primary' : 'bg-muted')} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={cn("p-3 rounded-2xl transition-colors", sources.weather ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">القراءة الميدانية (الجوال)</CardTitle>
              <CardDescription>مدخلات المستخدم المباشرة</CardDescription>
            </div>
            <Switch checked={sources.weather} onCheckedChange={() => toggleSource('weather')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              مقارنة درجة الحرارة التي تشاهدها في جوالك مع توقعات تقويم ابن عميرة وتصحيح التوصيات بناءً على الواقع الميداني.
            </p>
            {sources.weather && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <span className="text-primary font-bold">نمط القراءة اليدوية</span>
                  <span className="flex items-center gap-1 text-primary"><Radio className="h-3 w-3" /> نشط</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Source 2 */}
        <Card className="bento-card border-none overflow-hidden p-2">
          <div className={cn("h-1.5 transition-colors duration-500", sources.agriDb ? 'bg-primary' : 'bg-muted')} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={cn("p-3 rounded-2xl transition-colors", sources.agriDb ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
              <Database className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">قاعدة البيانات الزراعية</CardTitle>
              <CardDescription>توصيات المحاصيل المعتمدة</CardDescription>
            </div>
            <Switch checked={sources.agriDb} onCheckedChange={() => toggleSource('agriDb')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              تحديث قائمة الآفات الزراعية والحلول العلاجية وتوصيات البذور المعتمدة لكل حزام مناخي في المملكة.
            </p>
            {sources.agriDb && (
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> مزامنة مع المراجع المحلية
                </span>
                <span className="text-[10px] text-primary font-bold">نشط</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Source 3 */}
        <Card className="bento-card border-none overflow-hidden p-2">
          <div className={cn("h-1.5 transition-colors duration-500", sources.iotSensors ? 'bg-primary' : 'bg-muted')} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={cn("p-3 rounded-2xl transition-colors", sources.iotSensors ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
              <Cpu className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">حساسات IoT الميدانية</CardTitle>
              <CardDescription>رطوبة التربة والملوحة</CardDescription>
            </div>
            <Switch checked={sources.iotSensors} onCheckedChange={() => toggleSource('iotSensors')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              استقبال البيانات المباشرة من حقولك وتفعيل أنظمة الري الذكية بناءً على حاجة المحصول الفعلية (قريباً).
            </p>
          </CardContent>
        </Card>

        {/* Connection Source 4 */}
        <Card className="bento-card border-none overflow-hidden p-2">
          <div className={cn("h-1.5 transition-colors duration-500", sources.satellite ? 'bg-primary' : 'bg-muted')} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={cn("p-3 rounded-2xl transition-colors", sources.satellite ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">صور الأقمار الصناعية</CardTitle>
              <CardDescription>تحليل الغطاء النباتي (NDVI)</CardDescription>
            </div>
            <Switch checked={sources.satellite} onCheckedChange={() => toggleSource('satellite')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              مراقبة صحة المحاصيل من الفضاء والكشف المبكر عن الإجهاد المائي أو الإصابات الحشرية (قريباً).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
