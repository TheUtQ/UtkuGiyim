/**
 * SEO Content API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllSeoContent, getAllSeoContentAdmin, createSeoContent, updateSeoContent, deleteSeoContent } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch all SEO content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    if (admin === 'true') {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
      }
      return NextResponse.json(await getAllSeoContentAdmin());
    }

    return NextResponse.json(await getAllSeoContent());
  } catch (error) {
    console.error('SEO Content GET error:', error);
    return NextResponse.json({ error: 'İçerik yüklenemedi.' }, { status: 500 });
  }
}

// POST - Create SEO content
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Başlık ve içerik zorunludur.' }, { status: 400 });
    }

    const id = await createSeoContent(data);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('SEO Content POST error:', error);
    return NextResponse.json({ error: 'İçerik eklenemedi.' }, { status: 500 });
  }
}

// PUT - Update SEO content
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'ID zorunludur.' }, { status: 400 });
    }

    const { id, ...rest } = data;
    await updateSeoContent(id, rest);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO Content PUT error:', error);
    return NextResponse.json({ error: 'İçerik güncellenemedi.' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID zorunludur.' }, { status: 400 });
    }

    await deleteSeoContent(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SEO Content DELETE error:', error);
    return NextResponse.json({ error: 'İçerik silinemedi.' }, { status: 500 });
  }
}
