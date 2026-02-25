import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getAllProductsAdmin, createProduct } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');

    if (admin === 'true') {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
      return NextResponse.json(getAllProductsAdmin());
    }

    let products = getAllProducts() as Record<string, unknown>[];

    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (brand) {
      products = products.filter(p => p.brand_slug === brand);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Ürünler yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const data = await request.json();

    if (!data.title || !data.slug || !data.category) {
      return NextResponse.json({ error: 'Başlık, slug ve kategori zorunludur.' }, { status: 400 });
    }
    if (!data.brand_id) {
      return NextResponse.json({ error: 'Marka bilgisi zorunludur.' }, { status: 400 });
    }

    const result = createProduct(data);
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Ürün eklenemedi.' }, { status: 500 });
  }
}
