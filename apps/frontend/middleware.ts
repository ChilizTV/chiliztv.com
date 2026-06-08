import { NextResponse, type NextRequest } from 'next/server';

const LANDING_URL =
  process.env.LANDING_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://predcast.tv'
    : 'http://localhost:3002');

// Public-access toggle — when "true", the access-code gate is bypassed.
// Set on environments we want fully open (e.g. staging for demos).
// Production keeps the gate ON unless explicitly overridden.
const ACCESS_GATE_DISABLED = process.env.NEXT_PUBLIC_ACCESS_GATE_DISABLED === 'true';

export function middleware(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next();
  }

  if (ACCESS_GATE_DISABLED) {
    return NextResponse.next();
  }

  if (!request.cookies.has('cwk_access')) {
    return NextResponse.redirect(LANDING_URL);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|mp4|mp3)$).*)'],
};
