"use client";

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { FileText, Home, Menu, Settings, Tags } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

// Define navigation links for reuse
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/tags', label: 'Tags', icon: Tags },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// Reusable NavLink component for consistent styling
type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && (href !== '/' || pathname === '/');

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-sm p-2 font-mono text-sm transition-colors ${
        isActive
          ? 'bg-amber-200 text-foreground font-bold'
          : 'text-foreground/80 hover:bg-amber-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

// Mobile navigation that appears on small screens
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden bg-amber-100 border-2 border-foreground">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col bg-amber-50 border-r-2 border-foreground p-0">
        <nav className="grid gap-2 text-lg font-medium mt-4 p-4">
          <h1 className="text-xl font-bold font-serif tracking-wider p-2 mb-2 border-b-2 border-foreground">
            AI CMS
          </h1>
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Desktop sidebar
function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r-2 border-foreground bg-amber-50">
      <div className="p-4 border-b-2 border-foreground">
        <h1 className="text-xl font-bold font-serif tracking-wider">AI CMS Dashboard</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>
      <div className="p-4 border-t-2 border-foreground">
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
}

// The main client component that structures the layout
export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-amber-100">
      <DesktopSidebar />
      <div className="flex flex-col flex-1">
        <header className="flex h-14 items-center gap-4 border-b-2 border-foreground bg-amber-50 px-4 md:hidden">
          <MobileNav />
          <div className="flex-1 text-right">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 m-2 md:m-4 bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          {children}
        </main>
      </div>
    </div>
  );
}