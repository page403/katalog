import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (username === 'wahid' && password === '111') {
    const cookieStore = await cookies();
    cookieStore.set('auth', 'true', { path: '/' });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
