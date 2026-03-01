/**
 * Site Settings API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, updateSetting } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch all settings (public)
export async function GET() {
  try {
    const settings = getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Ayarlar yüklenemedi.' }, { status: 500 });
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();

    for (const [key, value] of Object.entries(data)) {
      updateSetting(key, String(value));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi.' }, { status: 500 });
  }
}
