import Link from 'next/link';
import { cookies } from 'next/headers';
import { getProducts } from '@/lib/storage';
import CatalogPage from '@/components/CatalogPage';
import { getCategories, getTags } from '@/lib/storage';

export default async function Home() {
  const products = await getProducts();
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('auth')?.value === 'true';

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="flex justify-end mb-4">
        {!isLoggedIn ? (
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
            Admin Panel
          </Link>
        )}
      </div>
      <CatalogPage products={products} categories={categories} tags={tags} />
    </div>
  );
}
