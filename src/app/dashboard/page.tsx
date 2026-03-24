
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudRain, Database, Cpu, Settings, Globe, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <Settings className="h-8 w-8" />
            لوحة تحكم الربط الذكي
          </h1>
          <p className="text-muted-foreground mt-2">قم بتفعيل وإدارة الاتصال بمصادر البيانات الخارجية والمستشعرات الميدانية.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 border-primary text-primary">
          <Zap className="h-3 w-3 mr-2" />
          النظام يعمل بكفاءة
        </Badge>
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
              <CardDescription>الربط مع محطات الأرصاد العالمية</CardDescription>
            </div>
            <Switch checked={sources.weather} onCheckedChange={() => toggleSource('weather')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              تفعيل هذا الخيار يسمح للنظام بمقارنة توقعات تقويم ابن عميرة مع الحالة الجوية الفعلية وتعديل التوصيات فوراً.
            </p>
            {sources.weather && (
              <div className="mt-4 flex items-center gap-2 text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded border border-green-100">
                <Globe className="h-3 w-3" />
                متصل بـ: OpenWeather API v3.0
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
              <CardDescription>مزامنة مع وزارة الزراعة والبيئة</CardDescription>
            </div>
            <Switch checked={sources.agriDb} onCheckedChange={() => toggleSource('agriDb')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              تحديث آلي لقائمة الآفات الزراعية، الدعم الحكومي، وتوصيات البذور المعتمدة لكل موسم.
            </p>
            {sources.agriDb && (
              <div className="mt-4 flex items-center gap-2 text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded border border-green-100">
                <ShieldCheck className="h-3 w-3" />
                المزامنة الأخيرة: منذ 15 دقيقة
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
              <CardTitle className="text-xl">مستشعرات IoT الميدانية</CardTitle>
              <CardDescription>رطوبة التربة، الملوحة، والحرارة</CardDescription>
            </div>
            <Switch checked={sources.iotSensors} onCheckedChange={() => toggleSource('iotSensors')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              استقبال البيانات مباشرة من الحقل عبر بروتوكول MQTT وتفعيل أنظمة الري الذكية بناءً على حاجة المحصول.
            </p>
            {!sources.iotSensors && (
              <Button variant="link" className="mt-2 h-auto p-0 text-xs text-primary font-bold">
                شراء الحساسات المدعومة →
              </Button>
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
              <CardDescription>تحليل مؤشر الغطاء النباتي (NDVI)</CardDescription>
            </div>
            <Switch checked={sources.satellite} onCheckedChange={() => toggleSource('satellite')} />
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
              مراقبة صحة المحاصيل من الفضاء والكشف المبكر عن الإجهاد المائي أو الإصابات الحشرية الواسعة.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 bg-muted/30 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center text-center">
        <h3 className="font-bold text-lg mb-2">هل ترغب في إضافة مصدر بيانات مخصص؟</h3>
        <p className="text-sm text-muted-foreground max-w-lg mb-6 leading-relaxed">
          يدعم نظامنا الربط مع معظم أنظمة إدارة المزارع (FMS) عبر واجهة API مفتوحة. يمكنك طلب مفاتيح الربط الآن.
        </p>
        <Button className="bg-primary px-8">طلب مفتاح API</Button>
      </div>
    </div>
  );
}
