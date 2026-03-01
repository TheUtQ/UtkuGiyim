import { getProductBySlug, getAllProducts } from '@/lib/db';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) as unknown as { title: string; description: string; brand_name: string } | undefined;
  if (!product) return { title: 'Ürün Bulunamadı' };
  return {
    title: `${product.brand_name ? product.brand_name + ' - ' : ''}${product.title} | Utku Giyim`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient product={product as never} />;
}
