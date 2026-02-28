/**
 * Admin Account API - Change username & password
 * PUT /api/auth/account
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, updateAdminCredentials, validateAdminPassword } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Session kontrolü
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { currentPassword, newUsername, newPassword } = await request.json();

    if (!currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre, yeni kullanıcı adı ve yeni şifre zorunludur.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Mevcut şifreyi doğrula
    const currentUsername = session.username as string;
    const isValid = await validateAdminPassword(currentUsername, currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre hatalı.' },
        { status: 401 }
      );
    }

    // Yeni kullanıcı adı zaten var mı?
    if (newUsername !== currentUsername) {
      const existing = await getAdminByUsername(newUsername);
      if (existing) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor.' },
          { status: 409 }
        );
      }
    }

    // Güncelle
    const success = await updateAdminCredentials(currentUsername, newUsername, newPassword);
    if (!success) {
      return NextResponse.json({ error: 'Kullanıcı güncellenemedi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Hesap bilgileri güncellendi.' });
  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
