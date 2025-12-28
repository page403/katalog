'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  id: string;
  title: string;
  price: number;
  pcsPrice?: number | null;
  image?: string;
  qty: number;
  unit?: 'CTN' | 'PCS';
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const salesPhone = '62895346372918';

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
    return items.reduce((sum, it) => {
      const unitPrice = it.unit === 'PCS' && it.pcsPrice != null ? it.pcsPrice : it.price;
      return sum + unitPrice * it.qty;
    }, 0);
  }, [items]);

  const buildWhatsappMessage = () => {
    const lines = items.map((it) => {
      const unitPrice = it.unit === 'PCS' && it.pcsPrice != null ? it.pcsPrice : it.price;
      const subtotal = unitPrice * it.qty;
      return `- ${it.title} ${it.qty} ${it.unit || 'CTN'}`;
    });
    const header = `Order:\n`;
    const footer = `\nTotal: Rp ${total.toLocaleString('id-ID')}`;
    return header + lines.join('\n') + footer;
  };

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
                <div key={it.id} className="py-4">
                  <div className="flex items-center gap-4">
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
                      <div className="text-sm text-gray-600">
                        Rp. {(it.unit === 'PCS' && it.pcsPrice != null ? it.pcsPrice : it.price).toLocaleString('id-ID')} / {it.unit || 'CTN'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Unit</span>
                      <div className="flex rounded-md border border-gray-200 overflow-hidden">
                        <button
                          className={`px-2 py-1 text-sm ${it.unit !== 'PCS' ? 'bg-gray-100' : ''}`}
                          onClick={() => {
                            const next = [...items];
                            next[idx] = { ...next[idx], unit: 'CTN' };
                            save(next);
                          }}
                        >
                          CTN
                        </button>
                        <button
                          className={`px-2 py-1 text-sm ${it.unit === 'PCS' ? 'bg-gray-100' : ''}`}
                          onClick={() => {
                            if (it.pcsPrice == null) return;
                            const next = [...items];
                            next[idx] = { ...next[idx], unit: 'PCS' };
                            save(next);
                          }}
                          disabled={it.pcsPrice == null}
                        >
                          PCS
                        </button>
                      </div>
                    </div>
                    <button
                      aria-label="Remove"
                      className="p-2 rounded border border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        const next = items.filter((_, i) => i !== idx);
                        save(next);
                      }}
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="text-lg">
                Total: <span className="font-semibold">Rp. {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Empty cart"
                  title="Empty cart"
                  className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  onClick={() => setConfirmClear(true)}
                >
                  🗑️
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    if (!items.length) return;
                    const msg = buildWhatsappMessage();
                    const url = `https://wa.me/${salesPhone}?text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank');
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
            {confirmClear && (
              <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
                <div className="w-full max-w-sm bg-white rounded-xl shadow ring-1 ring-gray-200 p-4">
                  <div className="text-lg font-semibold mb-2">Empty Cart</div>
                  <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove all items from the cart?</p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        save([]);
                        setConfirmClear(false);
                      }}
                    >
                      Empty
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
