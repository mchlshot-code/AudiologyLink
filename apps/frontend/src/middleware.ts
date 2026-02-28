import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    const hasToken = request.cookies.has("accessToken");

    // Already logged in → redirect away from login
    if (isPublic && hasToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Not logged in → redirect to login
    if (!isPublic && !hasToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next (static files)
         * - api (API routes)
         * - favicon.ico, logo files, public assets
         */
        "/((?!_next|api|favicon\\.ico|logo\\.png|logo-rbg\\.png).*)",
    ],
};
