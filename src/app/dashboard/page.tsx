
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudRain, Database, Cpu, Settings, Globe, ShieldCheck, Zap, Activity, Radio, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ControlPanel() {
  const [sources, setSources] = useState({
    weather: true,
    agriDb: true,
    iotSensors: false,
    satellite: false,
  });

  const toggleSource = (key: keyof typeof sources) => {
    setSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <Settings className="h-8 w-8" />
            لوحة تحكم الربط الذكي
          </h1>
          <p className="text-muted-foreground mt-2">إدارة الاتصال بمصادر البيانات الخارجية والمستشعرات الميدانية وتحديث التقويم آلياً.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 border-primary text-primary bg-primary/5 flex gap-2">
          <Zap className="h-3 w-3" />
          النظام متصل ويعمل
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/70">إجمالي المصادر المتصلة</CardDescription>
            <CardTitle className="text-4xl">2 / 4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-white/40 rounded"></div>
              <div className="h-1 flex-1 bg-white/40 rounded"></div>
              <div className="h-1 flex-1 bg-white/10 rounded"></div>
              <div className="h-1 flex-1 bg-white/10 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardDescription>دقة البيانات الحالية</CardDescription>
            <CardTitle className="text-4xl">98%</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <Badge variant="secondary" className="bg-green-100 text-green-700">موثوق جداً</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-right">
            <CardDescription>آخر تحديث للتقويم</CardDescription>
            <CardTitle className="text-xl">منذ 4 ساعات</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <Button variant="outline" size="sm" className="gap-2">
              <Activity className="h-3 w-3" /> تحديث يدوي
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Source 1 */}
        <Card className="border-none shadow-md overflow-hidden group">
          <div className={`h-2 transition-colors duration-300 ${sources.weather ? 'bg-green-500' : 'bg-muted'}`} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={`p-3 rounded-xl ${sources.weather ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
              <CloudRain className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">بيانات الطقس الحية</CardTitle>
              <CardDescription>توقعات الأرصاد الجوية</CardDescription>
            </div>
            <Switch checked={sources.weather} onCheckedChange={() => toggleSource('weather')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              مقارنة توقعات تقويم ابن عميرة مع الحالة الجوية الفعلية وتعديل التوصيات فوراً بناءً على درجات الحرارة والرياح.
            </p>
            {sources.weather && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] bg-green-50 p-2 rounded border border-green-100">
                  <span className="text-green-600 font-bold">OpenWeather API v3.0</span>
                  <span className="flex items-center gap-1 text-green-600"><Radio className="h-3 w-3 animate-pulse" /> نشط</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Source 2 */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className={`h-2 transition-colors duration-300 ${sources.agriDb ? 'bg-green-500' : 'bg-muted'}`} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={`p-3 rounded-xl ${sources.agriDb ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
              <Database className="h-6 w-6" />
            </div>
            <div className="flex-1 text-right">
              <CardTitle className="text-xl">قاعدة البيانات الزراعية</CardTitle>
              <CardDescription>توصيات المحاصيل الرسمية</CardDescription>
            </div>
            <Switch checked={sources.agriDb} onCheckedChange={() => toggleSource('agriDb')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              تحديث آلي لقائمة الآفات الزراعية والحلول العلاجية وتوصيات البذور المعتمدة لكل حزام مناخي في المملكة.
            </p>
            {sources.agriDb && (
              <div className="mt-4 p-2 rounded bg-orange-50 border border-orange-100 flex items-center justify-between">
                <span className="text-[10px] text-orange-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> مزامنة مع وزارة الزراعة
                </span>
                <span className="text-[10px] text-orange-600">ناجح</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Source 3 */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className={`h-2 transition-colors duration-300 ${sources.iotSensors ? 'bg-green-500' : 'bg-muted'}`} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={`p-3 rounded-xl ${sources.iotSensors ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
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
              استقبال البيانات المباشرة من حقولك عبر بروتوكول MQTT وتفعيل أنظمة الري الذكية بناءً على حاجة المحصول الفعلية.
            </p>
            {!sources.iotSensors && (
              <div className="mt-4 p-3 rounded bg-muted/50 border border-dashed flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> لا توجد أجهزة متصلة
                </span>
                <Button variant="link" size="sm" className="h-auto p-0 text-[10px]">إضافة جهاز +</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Source 4 */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className={`h-2 transition-colors duration-300 ${sources.satellite ? 'bg-green-500' : 'bg-muted'}`} />
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className={`p-3 rounded-xl ${sources.satellite ? 'bg-indigo-100 text-indigo-600' : 'bg-muted text-muted-foreground'}`}>
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
              مراقبة صحة المحاصيل من الفضاء والكشف المبكر عن الإجهاد المائي أو الإصابات الحشرية الواسعة في مساحاتك الزراعية.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
