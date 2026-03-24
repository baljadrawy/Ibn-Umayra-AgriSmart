
import type {Metadata} from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'تقويم ابن عميرة الزراعي الذكي',
  description: 'نظام زراعي ذكي يدمج الخبرة التراثية السعودية مع الذكاء الاصطناعي وبيانات الطقس الحية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-8 text-center border-t bg-muted/50">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} تقويم ابن عميرة الزراعي الذكي. جميع الحقوق محفوظة.
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
