import { getAllProducts, getAllBrands, getAllCategories } from '@/lib/db';
import ProductsClient from '@/components/ProductsClient';

export const metadata = {
  title: 'Ürünler | Utku Giyim',
  description: 'Premium motosiklet sele kılıfları ve vites sweatshirtleri. Marka ve kategoriye göre filtrele.',
};

export default function UrunlerPage() {
  const products = getAllProducts();
  const brands = getAllBrands();
  const categories = getAllCategories();

  return (
    <ProductsClient
      products={products as never}
      brands={brands as never}
      categories={categories as never}
    />
  );
}
