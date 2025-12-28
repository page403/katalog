'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem('cart');
        const parsed = raw ? JSON.parse(raw) : [];
        setItems(parsed);
      } catch {
        setItems([]);
      }
    });
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem('cart', JSON.stringify(next));
    } catch {}
  };

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.qty, 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Cart</h1>
          <Link href="/" className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50">
            ← Back
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="text-gray-600">Your cart is empty.</div>
        ) : (
          <>
            <div className="divide-y">
              {items.map((it, idx) => (
                <div key={it.id} className="py-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 bg-white rounded">
                    <Image
                      src={it.image || 'https://placehold.co/400'}
                      alt={it.title}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{it.title}</div>
                    <div className="text-sm text-gray-600">Rp. {it.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease"
                      className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                      onClick={() => {
                        const next = [...items];
                        next[idx] = { ...next[idx], qty: Math.max(1, next[idx].qty - 1) };
                        save(next);
                      }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{it.qty}</span>
                    <button
                      aria-label="Increase"
                      className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                      onClick={() => {
                        const next = [...items];
                        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
                        save(next);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    aria-label="Remove"
                    className="px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      const next = items.filter((_, i) => i !== idx);
                      save(next);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-lg">
                Total: <span className="font-semibold">Rp. {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  onClick={() => save([])}
                >
                  Empty Cart
                </button>
                <button className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
