import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

import { logger } from '@/lib/axiom/server';
import { transformMiddlewareRequest } from '@axiomhq/nextjs';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings'];

// Public routes that authenticated users shouldn't access
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest, event: NextFetchEvent) {
    logger.info(...transformMiddlewareRequest(request));
    event.waitUntil(logger.flush());

    const { pathname } = request.nextUrl;

    // Skip auth checks for API routes, static files, etc.
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/_vercel/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Apply internationalization middleware first
    const intlResponse = intlMiddleware(request);

    // Get the locale from the pathname or default locale
    const pathnameHasLocale = routing.locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    const locale = pathnameHasLocale
        ? pathname.split('/')[1]
        : routing.defaultLocale;

    // Remove locale from pathname for route matching
    const pathnameWithoutLocale = pathnameHasLocale
        ? pathname.slice(`/${locale}`.length) || '/'
        : pathname;

    // Check for session token in cookies
    const sessionToken = request.cookies.get(
        'better-auth.session_token'
    )?.value;
    const isAuthenticated = !!sessionToken;

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathnameWithoutLocale.startsWith(route)
    );

    // Check if current route is auth-only (login/signup)
    const isAuthRoute = authRoutes.some((route) =>
        pathnameWithoutLocale.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth routes to home
    if (isAuthRoute && isAuthenticated) {
        const homeUrl = new URL(`/${locale}`, request.url);
        return NextResponse.redirect(homeUrl);
    }

    return intlResponse;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher:
        '/((?!api|_next/static|_next/image|favicon.*|sitemap.xml|robots.txt|locales/*|manifest.json).*)',
};