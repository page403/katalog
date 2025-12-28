'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  CheckboxGroup,
  Checkbox,
  Slider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  status?: 'published' | 'archived';
  categoryId?: string | null;
  tagId?: string | null;
};

type MetaItem = { id: string; name: string };

export default function CatalogPage({
  products,
  categories,
  tags,
}: {
  products: Product[];
  categories: MetaItem[];
  tags: MetaItem[];
}) {
  const published = products.filter((p) => p.status !== 'archived');
  const [query, setQuery] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<'relevance' | 'price_asc' | 'price_desc' | 'title_asc'>('relevance');
  const [maxPrice] = useState<number>(() => Math.max(0, ...published.map((p) => p.price)));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Math.max(0, ...published.map((p) => p.price))]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of published) {
      const id = p.categoryId || '';
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
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
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
  }, [published, query, selectedCats, priceRange, sortKey]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center font-bold">E</div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#" className="hover:text-black">Home</a>
            <a href="#" className="hover:text-black">Categories</a>
            <a href="#" className="hover:text-black">Deals</a>
            <a href="#" className="hover:text-black">About</a>
          </nav>
        </div>
        <div className="flex items-center gap-3 w-full md:w-2/5">
          <Input
            aria-label="Search products"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
            startContent={<span className="text-gray-500">🔍</span>}
          />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button isIconOnly variant="light">❤️</Button>
          <Button isIconOnly variant="light">🛒</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-4">
        <aside className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Filters</span>
            <Button size="sm" variant="light" onClick={() => { setSelectedCats([]); setPriceRange([0, maxPrice]); setQuery(''); }}>
              Reset
            </Button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="font-medium mb-2">Categories</div>
              <CheckboxGroup
                value={selectedCats}
                onValueChange={(vals) => setSelectedCats(vals as string[])}
              >
                {categories.map((c) => (
                  <Checkbox key={c.id} value={c.id}>
                    <span className="flex justify-between w-full">
                      <span>{c.name}</span>
                      <span className="text-gray-400">{catCounts[c.id] ?? 0}</span>
                    </span>
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
            <div>
              <div className="font-medium mb-2">Price Range</div>
              <Slider
                value={priceRange}
                onChange={(val) => setPriceRange(val as [number, number])}
                minValue={0}
                maxValue={maxPrice}
                step={1}
                showSteps={false}
                className="max-w-full"
                aria-label="Price range"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Rp. {priceRange[0].toLocaleString('id-ID')}</span>
                <span>Rp. {priceRange[1].toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button isIconOnly variant="flat">🗂️</Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button endContent={<span>▾</span>} variant="flat">
                    Sort: {sortKey === 'relevance' ? 'Relevance' : sortKey === 'price_asc' ? 'Price: Low to High' : sortKey === 'price_desc' ? 'Price: High to Low' : 'Title: A-Z'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys as Set<string>)[0] as typeof sortKey;
                    setSortKey(key);
                  }}
                >
                  <DropdownItem key="relevance">Relevance</DropdownItem>
                  <DropdownItem key="price_asc">Price: Low to High</DropdownItem>
                  <DropdownItem key="price_desc">Price: High to Low</DropdownItem>
                  <DropdownItem key="title_asc">Title: A-Z</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <span className="text-sm text-gray-600">Products ({filtered.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const badge = product.tagId ? tagMap[product.tagId] : '';
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
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
                      <div className="absolute top-2 left-2 flex gap-2">
                        {badge && <Chip color={badge.toLowerCase().includes('new') ? 'success' : 'danger'} variant="solid" size="sm">{badge}</Chip>}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button isIconOnly size="sm" variant="ghost">♡</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-4">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-base font-semibold text-gray-900">{product.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-green-600">Rp. {product.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button size="sm" variant="flat" color="default">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No products match the filters.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
