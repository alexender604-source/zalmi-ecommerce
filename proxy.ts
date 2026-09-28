import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (process.env.DATABASE_URL?.trim()) return NextResponse.next();

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|zalmi-icon.png|images/).*)'],
};
