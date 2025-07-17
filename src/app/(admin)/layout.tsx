import { auth } from '@clerk/nextjs/server'; 
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Home, Settings, Tags } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">AI CMS Dashboard</h1>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/posts" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              Posts
            </Link>
            <Link 
              href="/tags" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <Tags className="h-4 w-4" />
              Tags
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
        </nav>
        
        <div className="p-4 border-t">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}