import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
}

async function getProducts(): Promise<Product[]> {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Product Store</h1>
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden bg-gray-200">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-lg font-bold text-green-600">${product.price}</span>
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
