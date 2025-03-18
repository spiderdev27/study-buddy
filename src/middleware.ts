import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/library',
  '/chat',
  '/tools',
  '/profile',
  '/settings',
];

// Paths that should not be accessible if authenticated
const authPaths = [
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Special case for login - we always allow direct access
const loginPath = '/login';

// Public paths that are accessible whether authenticated or not
const publicPaths = [
  '/',
  '/onboarding',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`[Middleware] Processing request for path: ${path}`);
  
  // Skip middleware for all API routes
  if (path.startsWith('/api/')) {
    console.log(`[Middleware] API route detected, skipping middleware: ${path}`);
    return NextResponse.next();
  }
  
  // Get the token to check if the user is logged in
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  console.log(`[Middleware] Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
  
  // Special case: Always allow direct access to login page
  if (path === loginPath) {
    console.log(`[Middleware] Login page detected, allowing direct access`);
    return NextResponse.next();
  }
  
  // Check if the path is a public path (accessible to all)
  const isPublicPath = publicPaths.some(publicPath => path === publicPath);
  if (isPublicPath) {
    console.log(`[Middleware] Public path detected, allowing access: ${path}`);
    return NextResponse.next();
  }
  
  // Check if the path is an auth path (register, forgot-password, etc.)
  const isAuthPath = authPaths.some(authPath => path === authPath || path.startsWith(`${authPath}/`));
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    console.log(`[Middleware] Authenticated user trying to access auth path, redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Check if the path is a protected path (dashboard, library, etc.)
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  // If user is not authenticated and trying to access protected pages, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    console.log(`[Middleware] Unauthenticated user trying to access protected path, redirecting to login`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // For all other cases, allow the request to proceed
  console.log(`[Middleware] No special conditions met, continuing with request`);
  return NextResponse.next();
}

// Make sure the matcher excludes API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 