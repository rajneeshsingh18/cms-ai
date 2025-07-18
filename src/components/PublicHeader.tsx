import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          My AI Blog
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/tags" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Tags
          </Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            About
          </Link>
          <Button asChild>
            <Link href="/dashboard">Admin Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}