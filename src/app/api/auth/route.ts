/**
 * Auth API - Login/Logout
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getAdminByUsername } from '@/lib/db';
import { createToken, setSessionCookie, clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gereklidir.' }, { status: 400 });
    }

    const isValid = await validateAdminPassword(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı adı veya şifre.' }, { status: 401 });
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 401 });
    }

    const token = await createToken({ userId: admin.id, username: admin.username });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Çıkış hatası.' }, { status: 500 });
  }
}
