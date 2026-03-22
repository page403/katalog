'use client';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  title: string;
  price: number;
  pcsPrice?: number | null;
  image?: string;
  status?: 'published' | 'archived';
  categoryId?: string | null;
  tagId?: string | null;
  tagIds?: string[];
  supplierId?: string | null;
};

type Banner = {
  id: string;
  title: string;
  price: number;
  image: string;
  link?: string;
  active: boolean;
};

type MetaItem = { id: string; name: string };

export default function CatalogPage({
  products,
  categories,
  tags,
  suppliers,
  banners = [],
}: {
  products: Product[];
  categories: MetaItem[];
  tags: MetaItem[];
  suppliers: MetaItem[];
  banners?: Banner[];
}) {
  const published = products.filter((p) => p.status !== 'archived');
  const activeBanners = banners.filter(b => b.active);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isBannerOpen, setIsBannerOpen] = useState(true);

  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<
    'relevance' | 'price_asc' | 'price_desc' | 'title_asc' | 'category_asc' | 'brand_asc'
  >('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const maxPrice = useMemo(() => Math.max(0, ...published.map((p) => p.price)), [published]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(maxPrice);
  const [cartCount, setCartCount] = useState<number>(0);

  const categoryNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categories) m[c.id] = c.name;
    return m;
  }, [categories]);

  const supplierNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of suppliers) m[s.id] = s.name;
    return m;
  }, [suppliers]);

  const addToCart = (p: Product) => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('cart') : null;
      const cart: Array<{ id: string; title: string; price: number; pcsPrice?: number | null; image?: string; qty: number; unit?: 'CTN' | 'PCS' }> = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        cart[idx].qty += 1;
      } else {
        cart.push({ id: p.id, title: p.title, price: p.price, pcsPrice: p.pcsPrice ?? null, image: p.image, qty: 1, unit: 'CTN' });
      }
      window.localStorage.setItem('cart', JSON.stringify(cart));
      const count = cart.reduce((sum, it) => sum + it.qty, 0);
      setCartCount(count);
    } catch {}
  };
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem('cart');
        const cart: Array<{ qty: number }> = raw ? JSON.parse(raw) : [];
        const count = cart.reduce((sum, it) => sum + it.qty, 0);
        setCartCount(count);
      } catch {}
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart') {
        try {
          const cart: Array<{ qty: number }> = e.newValue ? JSON.parse(e.newValue) : [];
          const count = cart.reduce((sum, it) => sum + it.qty, 0);
          setCartCount(count);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (activeBanners.length > 1 && isBannerOpen) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length, isBannerOpen]);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const sync = () => setFiltersOpen(mql.matches);
    sync();

    // Keep desktop/mobile panel behavior consistent on resize.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMql = mql as any;
    if (anyMql.addEventListener) {
      anyMql.addEventListener('change', sync);
      return () => anyMql.removeEventListener('change', sync);
    }
    // Safari fallback
    anyMql.addListener(sync);
    return () => anyMql.removeListener(sync);
  }, []);

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

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of published) {
      const ids = p.tagIds && p.tagIds.length ? p.tagIds : (p.tagId ? [p.tagId] : []);
      for (const id of ids) {
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    return counts;
  }, [published]);


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
    if (selectedTags.length) {
      const set = new Set(selectedTags);
      list = list.filter((p) => {
        const ids = p.tagIds && p.tagIds.length ? p.tagIds : (p.tagId ? [p.tagId] : []);
        return ids.some((id) => set.has(id));
      });
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
      case 'category_asc':
        list.sort((a, b) =>
          (categoryNameById[a.categoryId || ''] || '').localeCompare(
            categoryNameById[b.categoryId || ''] || ''
          )
        );
        break;
      case 'brand_asc':
        list.sort((a, b) =>
          (supplierNameById[a.supplierId || ''] || '').localeCompare(
            supplierNameById[b.supplierId || ''] || ''
          )
        );
        break;
      case 'relevance':
      default:
        break;
    }
    return list;
  }, [
    published,
    query,
    selectedCats,
    selectedBrands,
    selectedTags,
    minPrice,
    maxPriceFilter,
    sortKey,
    categoryNameById,
    supplierNameById,
  ]);

  return (
    <div className="min-h-screen pb-40">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-end py-1 px-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
        
        <div className="flex items-center justify-between w-full">
          <img src="https://cat-lac-nine.vercel.app/logo192.png" alt="Lumbung Pangan Semesta" className="h-10" />
          <Link href="/cart" className="relative p-2 rounded-md hover:bg-gray-100">
            🛒
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-600 rounded-full" />}
          </Link>
        </div>
      </header>

      <div
        className={`${filtersOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 bg-black/20 z-20`}
        onClick={() => {
          setFiltersOpen(false);
          setSearchOpen(false);
          setSortOpen(false);
        }}
      />

      <div
        className={`grid grid-cols-1 gap-6 mt-12 md:mt-16 ${
          filtersOpen ? 'md:grid-cols-[280px_1fr]' : 'md:grid-cols-[1fr]'
        }`}
      >
        <aside
          id="filters-panel"
          className={`${filtersOpen ? 'block' : 'hidden'} bg-white rounded-xl p-4 ring-1 ring-gray-200 fixed left-0 right-0 top-12 bottom-40 overflow-auto z-30 md:static md:left-auto md:right-auto md:top-auto md:bottom-auto md:overflow-visible`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Filters</span>
            <button
              className="text-sm px-3 py-1 rounded-md hover:bg-gray-100"
              onClick={() => {
                setSelectedCats([]);
                setSelectedBrands([]);
                setSelectedTags([]);
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
              <div className="font-medium mb-2">Tags</div>
              <div className="space-y-2 max-h-40 overflow-auto pr-2">
                {tags.map((t) => (
                  <label key={t.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(t.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedTags((prev) =>
                            checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                          );
                        }}
                      />
                      <span>{t.name}</span>
                    </div>
                    <span className="text-gray-400">{tagCounts[t.id] ?? 0}</span>
                  </label>
                ))}
                {tags.length === 0 && <div className="text-xs text-gray-500">No tags available</div>}
              </div>
            </div>
            
          </div>
        </aside>

        <section className="space-y-4">
          {activeBanners.length > 0 && isBannerOpen && (
            <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 animate-in fade-in duration-500">
              {/* Close Button */}
              <button 
                onClick={() => setIsBannerOpen(false)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 text-gray-600 hover:bg-black/20 hover:text-black transition-all"
                title="Dismiss ad"
              >
                ✕
              </button>

              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="flex transition-transform duration-700 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                  >
                    {activeBanners.map((banner) => (
                      <div key={banner.id} className="relative min-w-full h-full flex flex-col md:flex-row">
                        {/* Banner Image */}
                        {banner.link && (
                            <Link 
                              href={banner.link.startsWith('http') ? banner.link : `https://${banner.link}`}
                              className="inline-block w-fit text-white font-semibold rounded-lg transition-colors text-xs md:text-sm"
                            >
                              {/* Check Details */}
                              <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-full bg-white">
                          <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          
                        </div>
                        </Link>
                          )}
                        
                        {/* Banner Content */}
                        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-gray-50 md:h-full">
                          <span className="text-xs md:text-sm font-bold tracking-widest text-blue-600 uppercase mb-1 md:mb-2">{banner.title}</span>
                          {banner.price > 0 && (
                            <p className="text-lg md:text-xl font-semibold text-green-600 mb-3 md:mb-4">
                              Rp. {banner.price.toLocaleString('id-ID')}
                            </p>
                          )}
                          
                        </div>
                            
                        
                      </div>
                    ))}
                  </div>

                {activeBanners.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentBanner((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => setCurrentBanner((prev) => (prev + 1) % activeBanners.length)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900"
                    >
                      →
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {activeBanners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentBanner(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentBanner ? 'bg-gray-800 w-3' : 'bg-gray-400'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Products ({filtered.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
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
                    <div className="absolute top-2 right-2">
                      {/* removed heart icon */}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-base font-semibold text-gray-900">{product.title}</h2>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-green-600">Rp. {product.price.toLocaleString('id-ID')}</span>
                        <button
                          aria-label="Add to cart"
                          onClick={() => addToCart(product)}
                          className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                          title="Add to cart"
                        >
                          🛒
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

      {/* Sticky bottom controls */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200">
        <div className="px-4 py-3">
          <div className="flex flex-row gap-2 md:flex-row md:items-center md:justify-center md:gap-3">
            <div className="relative w-full max-w-xs hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                aria-label="Search products"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <button
              className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
              onClick={() => {
                setSearchOpen((v) => !v);
                setSortOpen(false);
              }}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              🔍
            </button>

            <button
              className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                setFiltersOpen((v) => !v);
                setSearchOpen(false);
                setSortOpen(false);
              }}
              aria-controls="filters-panel"
              aria-expanded={filtersOpen}
            >
              <span aria-hidden>🗂️</span>
              <span className="hidden sm:inline text-sm font-medium">{filtersOpen ? 'Hide' : 'Filters'}</span>
            </button>

            <button
              className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
              onClick={() => {
                setSortOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-label={sortOpen ? 'Close sort' : 'Open sort'}
              aria-expanded={sortOpen}
            >
              ↕️
            </button>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="hidden md:block px-3 py-2 rounded-md border border-gray-300 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Title: A–Z</option>
              <option value="category_asc">Category: A–Z</option>
              <option value="brand_asc">Brand: A–Z</option>
            </select>
          </div>

          {searchOpen && (
            <div className="md:hidden relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                aria-label="Search products"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          )}

          {sortOpen && (
            <div className="md:hidden mt-2">
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value as typeof sortKey);
                  setSortOpen(false);
                }}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Title: A–Z</option>
                <option value="category_asc">Category: A–Z</option>
                <option value="brand_asc">Brand: A–Z</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-30 right-4 p-3 rounded-full bg-gray-800 text-white shadow hover:bg-gray-900"
      >
        ↑
      </button>
    </div>
  );
}
