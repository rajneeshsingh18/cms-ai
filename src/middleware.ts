import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that should be protected
const isProtectedRoute = createRouteMatcher([
  '/admin/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protect the routes that match the isProtectedRoute pattern
  if (isProtectedRoute(req)) {
    auth();
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};