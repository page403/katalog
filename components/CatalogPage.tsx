'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  status?: 'published' | 'archived';
  categoryId?: string | null;
  tagId?: string | null;
  supplierId?: string | null;
};

type MetaItem = { id: string; name: string };

export default function CatalogPage({
  products,
  categories,
  tags,
  suppliers,
}: {
  products: Product[];
  categories: MetaItem[];
  tags: MetaItem[];
  suppliers: MetaItem[];
}) {
  const published = products.filter((p) => p.status !== 'archived');
  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<'relevance' | 'price_asc' | 'price_desc' | 'title_asc'>('relevance');
  const maxPrice = useMemo(() => Math.max(0, ...published.map((p) => p.price)), [published]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(maxPrice);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of published) {
      const id = p.categoryId || '';
      if (!id) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }, [published]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of published) {
      const id = p.supplierId || '';
      if (!id) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }, [published]);

  const tagMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of tags) m[t.id] = t.name;
    return m;
  }, [tags]);

  const filtered = useMemo(() => {
    let list = [...published];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (selectedCats.length) {
      const set = new Set(selectedCats);
      list = list.filter((p) => (p.categoryId ? set.has(p.categoryId) : false));
    }
    if (selectedBrands.length) {
      const set = new Set(selectedBrands);
      list = list.filter((p) => (p.supplierId ? set.has(p.supplierId) : false));
    }
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPriceFilter);
    switch (sortKey) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'title_asc':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
      default:
        break;
    }
    return list;
  }, [published, query, selectedCats, selectedBrands, minPrice, maxPriceFilter, sortKey]);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-end py-1 px-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
        <div className="hidden md:flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-gray-100">🛒</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-16">
        <aside className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Filters</span>
            <button
              className="text-sm px-3 py-1 rounded-md hover:bg-gray-100"
              onClick={() => {
                setSelectedCats([]);
                setMinPrice(0);
                setMaxPriceFilter(maxPrice);
                setQuery('');
              }}
            >
              Reset
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="font-medium mb-2">Categories</div>
              <div className="space-y-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedCats((prev) =>
                            checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                          );
                        }}
                      />
                      <span>{c.name}</span>
                    </div>
                    <span className="text-gray-400">{catCounts[c.id] ?? 0}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Brand</div>
              <div className="space-y-2">
                {suppliers.map((s) => (
                  <label key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(s.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedBrands((prev) =>
                            checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                          );
                        }}
                      />
                      <span>{s.name}</span>
                    </div>
                    <span className="text-gray-400">{brandCounts[s.id] ?? 0}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Price Range</div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-20 text-sm text-gray-600">Min</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-sm text-gray-600">Rp. {minPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-20 text-sm text-gray-600">Max</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-sm text-gray-600">Rp. {maxPriceFilter.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-48 md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  aria-label="Search products"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-50">🗂️</button>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title: A–Z</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">Products ({filtered.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const badge = product.tagId ? tagMap[product.tagId] : '';
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                    <div className="absolute top-2 left-2 flex gap-2">
                      {badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.toLowerCase().includes('new') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      {/* removed heart icon */}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-base font-semibold text-gray-900">{product.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-green-600">Rp. {product.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-md text-sm hover:bg-gray-200">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No products match the filters.</div>
            )}
          </div>
        </section>
      </div>
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900"
      >
        ↑
      </button>
    </div>
  );
}
