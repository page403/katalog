'use client';

import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="relative w-full bg-white aspect-[4/3]">
          <Image
            src={product.image || 'https://placehold.co/400'}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
            priority={false}
          />
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{product.title}</h2>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-green-600">
              Rp. {product.price.toLocaleString('id-ID')}
            </span>
            <Button size="sm" variant="flat" color="default">
              Add to Cart
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

