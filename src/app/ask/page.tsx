
"use client";

import { useState, useRef, useEffect } from 'react';
import { askAIAgentAgriculturalAdvice, type AskAIAgentAgriculturalAdviceOutput } from '@/ai/flows/ask-ai-agent-agricultural-advice-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Send, Bot, User, Loader2, Info, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  nawaa?: string;
};

export default function AskAI() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userZoneId, setUserZoneId] = useState('highlands');
  const [userCity, setUserCity] = useState('الطائف');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'أهلاً بك يا مزارعنا! أنا مستشارك الزراعي الذكي، خبير في تقويم ابن عميرة والظروف المناخية لمناطق المملكة. كيف أساعدك اليوم؟'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // قراءة المنطقة المحفوظة من localStorage
    const savedCity = localStorage.getItem('user_city');
    if (savedCity) {
      setUserCity(savedCity);
      // البحث عن الحزام المناخي بناءً على المدينة المحفوظة
      import('@/lib/location-data').then(({ CLIMATE_ZONES_DATA }) => {
        const zone = CLIMATE_ZONES_DATA.find(z => z.cities.includes(savedCity));
        if (zone) setUserZoneId(zone.id);
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // In a real app, zone_id would come from user profile
      const response = await askAIAgentAgriculturalAdvice({
        question: userMessage,
        zone_id: userZoneId, // مشتق من localStorage أو 'highlands' افتراضياً
        currentDate: new Date().toISOString().split('T')[0]
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        nawaa: response.related_nawaa
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-[700px] border rounded-2xl bg-white overflow-hidden shadow-lg">
          <div className="p-4 border-b bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold leading-none">المستشار الزراعي الذكي</h2>
                <p className="text-[10px] text-white/70 mt-1">مدعوم بتقنيات الذكاء الاصطناعي وتقويم ابن عميرة</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span>متصل</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-white" />}
                  </div>
                  <div className={`space-y-2`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-white rounded-tr-none' 
                        : 'bg-primary/5 text-foreground rounded-tl-none border border-primary/10'
                    }`}>
                      {m.content}
                    </div>
                    {m.nawaa && (
                      <Badge variant="outline" className="text-[10px] border-primary text-primary">
                        نوء: {m.nawaa}
                      </Badge>
                    )}
                    {m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-muted-foreground ml-1">المصادر:</span>
                        {m.sources.map(s => (
                          <span key={s} className="text-[10px] bg-muted px-1.5 rounded text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="flex gap-3 flex-row-reverse max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl rounded-tl-none border border-primary/10">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            <div className="relative">
              <Input
                placeholder="اسأل عن الزراعة، التوقيت، أو التقويم..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-12 py-6 rounded-xl border-2 focus-visible:ring-primary h-14"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute left-2 top-2 h-10 w-10 bg-primary hover:bg-primary/90 rounded-lg"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5 rtl:rotate-180" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              تذكر دائماً مراجعة التوصيات الزراعية الميدانية والتحقق من الظروف المحلية لمزرعتك.
            </p>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md bg-accent/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline">إرشادات المحادثة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 text-xs leading-relaxed">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p>حدد نوع المحصول الذي تسأل عنه لنوفر لك أدق المعلومات من التقويم.</p>
              </div>
              <div className="flex gap-3 text-xs leading-relaxed">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <p>الإجابات مرتبطة بمنطقتك المحفوظة: <strong>{userCity}</strong>. يمكنك تغييرها من الصفحة الرئيسية.</p>
              </div>
              <div className="pt-2 border-t border-primary/10">
                <p className="text-[10px] font-bold mb-2">أسئلة شائعة:</p>
                <div className="space-y-1">
                  {['متى أزرع الطماطم؟', 'هل وقت الرش مناسب الآن؟', 'متى ينتهي نجم العطف؟'].map(q => (
                    <button 
                      key={q} 
                      onClick={() => setInput(q)}
                      className="w-full text-right text-[10px] bg-white hover:bg-primary/5 p-2 rounded border border-primary/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline">إحصائيات التقويم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground mb-1">عدد الأنواء</p>
                  <p className="text-2xl font-bold text-primary">30</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-[10px] text-muted-foreground mb-1">الأحزمة المناخية المدعومة</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
