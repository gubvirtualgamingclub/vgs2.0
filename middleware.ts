import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Secret admin route (change this to your custom secret path)
const ADMIN_SECRET_ROUTE = process.env.ADMIN_SECRET_PATH || 'x-admin-control';

// Allowed admin emails (add your admin emails here)
const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ===================================================================
  // ADMIN ROUTE PROTECTION
  // ===================================================================

  // If the request is for the secret admin route, rewrite it to the actual /admin path
  if (pathname.startsWith(`/${ADMIN_SECRET_ROUTE}`)) {
    const newPath = pathname.replace(`/${ADMIN_SECRET_ROUTE}`, '/admin');
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    
    const response = NextResponse.rewrite(url);
    
    // Add security headers to the response
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
    
    return response;
  }

  // Block direct access to /admin routes
  if (pathname.startsWith('/admin')) {
    console.log('🚫 Blocked direct attempt to access /admin:', pathname);
    
    // Return generic 404 to hide admin route existence
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // ===================================================================
  // RATE LIMITING (Simple implementation)
  // ===================================================================
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `rate-limit:${ip}:${pathname}`;

  // You can implement rate limiting here using Redis or similar
  // For now, we'll add headers for monitoring
  const response = NextResponse.next();
  response.headers.set('X-Client-IP', ip);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
