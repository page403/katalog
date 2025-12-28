'use client';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full bg-white aspect-[4/3]">
        <Image
          src={product.image || 'https://placehold.co/400'}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
          priority={false}
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{product.title}</h2>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-green-600">
              Rp. {product.price.toLocaleString('id-ID')}
            </span>
            <button className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-md text-sm hover:bg-gray-200">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
