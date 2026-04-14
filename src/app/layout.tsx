
import type {Metadata} from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'التقويم الزراعي المطور',
  description: 'نظام زراعي ذكي مبني على تقويم ابن عميرة التراثي، معدَّل آلياً لكل مناطق المملكة مع بيانات الطقس الحي',
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
        <FirebaseClientProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-8 text-center border-t bg-muted/50 space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              © {new Date().getFullYear()} التقويم الزراعي المطور. جميع الحقوق محفوظة.
            </p>
            <p className="text-muted-foreground text-xs">
              تطوير{' '}
              <a
                href="https://twitter.com/jadrawy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                @jadrawy
              </a>
            </p>
          </footer>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
