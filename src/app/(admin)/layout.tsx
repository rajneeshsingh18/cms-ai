import { auth} from '@clerk/nextjs/server'; 
import { UserButton } from '@clerk/nextjs'; 

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Home, Settings } from 'lucide-react';

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
            {/* CORRECTED: Removed /admin prefix to match your working URLs */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href="/posts" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <FileText className="w-4 h-4" />
              Posts
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 p-2 rounded hover:bg-accent"
            >
              <Settings className="w-4 h-4" />
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