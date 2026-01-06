import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/wizard']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the current path requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute) {
        // Check for auth token in cookies
        const authToken = request.cookies.get('auth_token')

        if (!authToken) {
            // Redirect to login if no token found
            const loginUrl = new URL('/login', request.url)
            // Optional: Add return URL to redirect back after login
            loginUrl.searchParams.set('from', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

// Config to specify which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
