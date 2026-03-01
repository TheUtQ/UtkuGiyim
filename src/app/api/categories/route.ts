import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    if (admin === 'true') {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
      return NextResponse.json(await getAllCategoriesAdmin());
    }
    return NextResponse.json(await getAllCategories());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Kategoriler alınamadı.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    const data = await request.json();
    if (!data.name || !data.slug) return NextResponse.json({ error: 'İsim ve slug zorunlu.' }, { status: 400 });
    const id = await createCategory(data);
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Kategori eklenemedi.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'ID zorunlu.' }, { status: 400 });
    const { id, ...rest } = data;
    await updateCategory(id, rest);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    if (!id) return NextResponse.json({ error: 'ID zorunlu.' }, { status: 400 });
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Silme başarısız.' }, { status: 500 });
  }
}
