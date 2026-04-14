
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, History, MapPin, Sprout, Save, Trash2, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const CLIMATE_ZONES = [
  { id: 'zone-1', nameAr: 'المرتفعات الجبلية (الطائف، أبها)', offset: 0 },
  { id: 'zone-2', nameAr: 'الهضبة الوسطى (الرياض، القصيم)', offset: 7 },
  { id: 'zone-3', nameAr: 'السهول الشرقية (الأحساء، الدمام)', offset: -10 },
  { id: 'zone-4', nameAr: 'السهول الغربية (جدة، جازان)', offset: -7 },
  { id: 'zone-5', nameAr: 'المناطق الشمالية (تبوك، الجوف)', offset: 14 },
];

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [selectedZone, setSelectedZone] = useState('zone-1');
  const [logNote, setLogNote] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('طماطم');

  // Fetch Farm Logs
  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'farm_logs'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: logs, isLoading: isLogsLoading } = useCollection(logsQuery);

  const handleUpdateZone = () => {
    if (!user || !db) return;
    const userRef = doc(db, 'users', user.uid);
    updateDocumentNonBlocking(userRef, {
      zoneId: selectedZone,
      updatedAt: serverTimestamp(),
    });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !logNote.trim()) return;
    
    const logsRef = collection(db, 'users', user.uid, 'farm_logs');
    addDocumentNonBlocking(logsRef, {
      userId: user.uid,
      cropId: selectedCrop,
      action: 'نشاط زراعي',
      notes: logNote,
      nawaaId: 'السماك', // Current Nawaa context
      createdAt: new Date().toISOString()
    });
    setLogNote('');
  };

  if (isUserLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="text-right">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <Settings className="h-8 w-8" />
            لوحة التحكم الميدانية
          </h1>
          <p className="text-muted-foreground mt-2">إدارة الحزام المناخي وسجلات مزرعتك الشخصية.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 border-primary text-primary bg-primary/5 flex gap-2 rounded-full">
          <MapPin className="h-3 w-3" />
          {user ? `مرحباً، ${user.displayName || 'مزارعنا'}` : 'يرجى تسجيل الدخول'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Settings */}
        <div className="space-y-6">
          <Card className="bento-card border-none p-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">تخصيص الحزام المناخي</CardTitle>
              <CardDescription>سيتم تعديل مواعيد التقويم آلياً حسب منطقتك.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="اختر منطقتك" />
                </SelectTrigger>
                <SelectContent>
                  {CLIMATE_ZONES.map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateZone} className="w-full h-12 bg-primary rounded-xl gap-2">
                <Save className="h-4 w-4" /> حفظ المنطقة المرجعية
              </Button>
            </CardContent>
          </Card>

          <Card className="bento-card border-none p-2 shadow-lg bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl">إضافة نشاط للمزرعة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLog} className="space-y-4">
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="المحصول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="طماطم">طماطم</SelectItem>
                    <SelectItem value="نخل">نخل</SelectItem>
                    <SelectItem value="عنب">عنب</SelectItem>
                    <SelectItem value="بامية">بامية</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="ماذا فعلت اليوم؟ (مثلاً: ري، تسميد، زراعة)" 
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="rounded-xl"
                />
                <Button type="submit" className="w-full rounded-xl gap-2">
                  <Plus className="h-4 w-4" /> إضافة للسجل
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bento-card border-none p-2 shadow-lg min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" /> سجل الأنشطة الزراعية
                </CardTitle>
                <CardDescription>تاريخك الزراعي المرتبط بالأنواء.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">يجب تسجيل الدخول لمشاهدة وحفظ سجلك الزراعي.</p>
                </div>
              ) : isLogsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8" /></div>
              ) : logs?.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <Sprout className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">لا توجد سجلات بعد. ابدأ بإضافة أول نشاط لمزرعتك!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/5 hover:border-primary/20 transition-all group">
                      <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Sprout className="h-5 w-5" />
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{log.cropId}</p>
                            <Badge variant="outline" className="text-[10px] py-0">{log.nawaaId}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.notes}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-1">
                            {new Date(log.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'farm_logs', log.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
