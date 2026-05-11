import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/whitepaper']);

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has('cwk_access')) {
    const landing = request.nextUrl.clone();
    landing.pathname = '/';
    return NextResponse.redirect(landing);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|mp4|mp3)$).*)'],
};
