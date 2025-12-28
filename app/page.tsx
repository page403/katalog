import { getProducts } from '@/lib/storage';
import CatalogPage from '@/components/CatalogPage';
import { getCategories, getTags, getSuppliers } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();
  const [categories, tags, suppliers] = await Promise.all([getCategories(), getTags(), getSuppliers()]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <CatalogPage products={products} categories={categories} tags={tags} suppliers={suppliers} />
    </div>
  );
}
