import Link from 'next/link';
import { cookies } from 'next/headers';
import { getProducts } from '@/lib/storage';
import { ProductCard } from '@/components/ProductCard';

export default async function Home() {
  const products = await getProducts();
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('auth')?.value === 'true';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Katalog</h1>
        {!isLoggedIn ? (
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
            Admin Panel
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.filter(p => p.status !== 'archived').map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No products found.
        </div>
      )}
    </div>
  );
}
