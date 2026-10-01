import { NextResponse, type NextRequest } from 'next/server';

function hasUsableDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return false;

  try {
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) return false;
    if (process.env.VERCEL && ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return false;
    return Boolean(url.hostname && url.pathname.length > 1);
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  if (hasUsableDatabaseUrl()) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Store database is not configured.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (request.nextUrl.pathname === '/store-unavailable') return NextResponse.next();

  const unavailable = request.nextUrl.clone();
  unavailable.pathname = '/store-unavailable';
  unavailable.search = '';
  return NextResponse.rewrite(unavailable);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|zalmi-icon.png|images/|products/).*)'],
};
