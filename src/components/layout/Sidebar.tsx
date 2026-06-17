'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  MessageSquare,
  Plus,
  Sparkles,
  User,
  BookOpen,
  Moon,
  Sun,
  Menu,
  X,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/questions', label: 'All Questions', icon: MessageSquare },
  { href: '/questions/new', label: 'Add Question', icon: Plus },
  { href: '/ai-generate', label: 'AI Generate', icon: Sparkles },
  { href: '/practice', label: 'Practice Mode', icon: BookOpen },
  { href: '/about', label: 'My Profile', icon: User },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-sm gradient-text">Interview Prep</h1>
          <p className="text-xs text-muted-foreground">Q&A Manager</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'nav-link-active'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-primary' : 'group-hover:text-foreground'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full gap-2 justify-start"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-yellow-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-primary" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm gradient-text">Interview Prep</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-card border-border/50">
            <NavContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
