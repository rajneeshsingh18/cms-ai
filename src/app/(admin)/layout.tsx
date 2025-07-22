import { auth } from '@clerk/nextjs/server'; 
import { redirect } from 'next/navigation';
import AdminLayoutClient from './admin-layout-client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Perform the authentication check on the server
  const { userId } = await auth();
  
  // If no user is found, redirect to the sign-in page
  if (!userId) {
    redirect('/sign-in');
  }

  // If the user is authenticated, render the client-side layout component
  // and pass the children into it.
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}