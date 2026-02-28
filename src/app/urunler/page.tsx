import { getAllProducts, getAllBrands, getAllCategories } from '@/lib/db';
import ProductsClient from '@/components/ProductsClient';

export const metadata = {
  title: 'Ürünler | Utku Giyim',
  description: 'Premium motosiklet sele kılıfları ve vites sweatshirtleri. Marka ve kategoriye göre filtrele.',
};

export default async function UrunlerPage() {
  const products = await getAllProducts();
  const brands = await getAllBrands();
  const categories = await getAllCategories();

  return (
    <ProductsClient
      products={products as never}
      brands={brands as never}
      categories={categories as never}
    />
  );
}
