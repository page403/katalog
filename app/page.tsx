import Link from 'next/link';
import { cookies } from 'next/headers';
import { getProducts } from '@/lib/storage';

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
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-gray-200">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-lg font-bold text-green-600">Rp. {product.price.toLocaleString('id-ID')}</span>
                <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
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
