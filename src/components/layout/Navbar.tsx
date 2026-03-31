
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Leaf, Calendar, Sprout, MessageSquare, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/calendar', label: 'التقويم السنوي', icon: Calendar },
  { href: '/crops', label: 'دليل المحاصيل', icon: Sprout },
  { href: '/ask', label: 'المستشار الذكي', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="glass rounded-full px-6 h-16 flex items-center justify-between shadow-lg border border-white/40">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary shrink-0">
          <Leaf className="h-6 w-6" />
          <div className="flex flex-col">
            <span className="text-sm sm:text-base leading-none">التقويم الزراعي المطور</span>
            <span className="text-[9px] text-muted-foreground font-medium hidden sm:block">مبني على تقويم ابن عميرة</span>
          </div>
          <Badge variant="secondary" className="bg-accent/20 text-primary border-none text-[8px] px-1.5 py-0 rounded-sm">تجريبي</Badge>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 mx-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all duration-300",
                pathname === item.href 
                  ? "bg-primary text-white" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
           <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 right-0 glass rounded-[2rem] p-6 flex flex-col gap-4 md:hidden shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 text-sm font-bold p-4 rounded-2xl",
                pathname === item.href ? "bg-primary text-white" : "hover:bg-primary/10"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
