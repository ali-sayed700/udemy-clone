import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.userId) {
      return NextResponse.json({ userId: null }, { status: 401 });
    }
    return NextResponse.json({
      userId: session.user.userId,
      userName: session.user.userName,
      role: session.user.role,
      accessToken: session.accessToken,
    });
  } catch {
    return NextResponse.json({ userId: null }, { status: 401 });
  }
}
