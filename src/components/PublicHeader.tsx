"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="bg-amber-50 border-b-2 border-foreground sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Styled Blog Title */}
        <Link href="/" className="text-xl md:text-2xl font-bold font-serif tracking-wider">
          My AI Blog
        </Link>

        {/* Styled Navigation */}
        <nav className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="text-sm font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors hidden md:inline-block">
            Home
          </Link>
          <Link href="/tags" className="text-sm font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors hidden md:inline-block">
            Tags
          </Link>
          <Link href="/about" className="text-sm font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors hidden md:inline-block">
            About
          </Link>
          
          {/* Clerk Authentication Buttons with Retro Styling */}
          <SignedIn>
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="bg-amber-100 border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Dashboard
              </Button>
            </Link>
            <div className="ml-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                className="bg-foreground text-amber-50 rounded-md border-2 border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Admin Login
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}