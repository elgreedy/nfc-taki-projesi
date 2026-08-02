import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const expectedPassword = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!expectedPassword) {
      return NextResponse.json({ ok: false, error: 'ADMIN_PASSWORD tanımlı değil.' }, { status: 500 });
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ ok: false, error: 'Yanlış şifre.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: 'admin-auth',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: 'İstek işlenemedi.' }, { status: 400 });
  }
}
