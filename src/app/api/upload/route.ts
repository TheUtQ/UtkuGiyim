/**
 * File Upload API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    // Make sure it's a File and not a string
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPEG, PNG, WebP ve GIF desteklenir.' }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan büyük olamaz.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Upload to ImgBB
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error('IMGBB_API_KEY is missing');
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası (API Key eksik).' }, { status: 500 });
    }

    const imgbbData = new FormData();
    imgbbData.append('key', apiKey);
    imgbbData.append('image', base64Image);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbData,
    });

    const json = await res.json();
    if (!res.ok || !json.data || !json.data.url) {
      console.error('ImgBB API error:', json);
      return NextResponse.json({ error: 'Resim yükleme sunucusunda hata oluştu.' }, { status: 500 });
    }

    const url = json.data.url;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Dosya yüklenemedi.' }, { status: 500 });
  }
}
