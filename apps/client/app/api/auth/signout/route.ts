import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/signin', request.url));
  response.cookies.delete('session');
  return response;
}
