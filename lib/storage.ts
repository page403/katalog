import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';
import { neon } from '@neondatabase/serverless';

export interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string;
  supplierId?: string | null;
  tagId?: string | null;
  tagIds?: string[];
  status?: 'published' | 'archived';
  categoryId?: string | null;
  pcsPrice?: number | null;
}

export type AddProductInput = {
  title: string;
  price: number | string;
  description?: string;
  image?: string;
  supplierId?: string | null;
  tagId?: string | null;
  tagIds?: string[];
  categoryId?: string | null;
  pcsPrice?: number | string | null;
};

export type UpdateProductInput = {
  id: string;
  title: string;
  price: number | string;
  description?: string;
  image?: string;
  supplierId?: string | null;
  tagId?: string | null;
  tagIds?: string[];
  categoryId?: string | null;
  pcsPrice?: number | string | null;
};

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');
const suppliersFilePath = path.join(process.cwd(), 'data', 'suppliers.json');
const tagsFilePath = path.join(process.cwd(), 'data', 'tags.json');
const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');
const salesFilePath = path.join(process.cwd(), 'data', 'sales.json');
const kvReady = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const dbReady = !!dbUrl;
const sql = dbReady ? neon(dbUrl as string) : null;
const useDb = dbReady;
const useKv = !dbReady && kvReady;
const vercelWithoutStorage = !!process.env.VERCEL && !dbReady && !kvReady;
const KV_KEY = 'products';
const KV_SUPPLIERS_KEY = 'suppliers';
const KV_TAGS_KEY = 'tags';
const KV_CATEGORIES_KEY = 'categories';
const KV_SALES_KEY = 'sales';

async function readFsProducts(): Promise<Product[]> {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function writeFsProducts(products: Product[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Salesperson {
  id: string;
  name: string;
  phone: string;
}

async function readFsSuppliers(): Promise<Supplier[]> {
  try {
    const fileContents = fs.readFileSync(suppliersFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function writeFsSuppliers(suppliers: Supplier[]) {
  fs.writeFileSync(suppliersFilePath, JSON.stringify(suppliers, null, 2));
}

async function readFsTags(): Promise<Tag[]> {
  try {
    const fileContents = fs.readFileSync(tagsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function writeFsTags(tags: Tag[]) {
  fs.writeFileSync(tagsFilePath, JSON.stringify(tags, null, 2));
}

async function readFsCategories(): Promise<Category[]> {
  try {
    const fileContents = fs.readFileSync(categoriesFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function writeFsCategories(categories: Category[]) {
  fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2));
}

async function readFsSales(): Promise<Salesperson[]> {
  try {
    const fileContents = fs.readFileSync(salesFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

async function writeFsSales(sales: Salesperson[]) {
  fs.writeFileSync(salesFilePath, JSON.stringify(sales, null, 2));
}

async function ensureTable() {
  if (!useDb || !sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC NOT NULL,
      description TEXT,
      image TEXT,
      supplier_id TEXT,
      tag_id TEXT,
      status TEXT DEFAULT 'published'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS salespeople (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL
    )
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS supplier_id TEXT
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS tag_id TEXT
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS category_id TEXT
  `;
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS price_pcs NUMERIC
  `;
}

export async function getProducts(): Promise<Product[]> {
  if (useDb && sql) {
    await ensureTable();
    type DbProductRow = { id: string; title: string; price: number | string; price_pcs: number | string | null; description: string; image: string; status: 'published' | 'archived' | null; category_id: string | null; supplier_id: string | null; tag_id: string | null };
    const rows = await sql`
      SELECT id, title, price, price_pcs, description, image, status, category_id, supplier_id, tag_id
      FROM products
      ORDER BY title
    ` as unknown as DbProductRow[];
    return rows.map((r) => ({
      ...r,
      price: Number(r.price),
      status: (r.status || 'published') as 'published' | 'archived',
      categoryId: r.category_id,
      supplierId: r.supplier_id,
      tagId: r.tag_id,
      tagIds: r.tag_id ? r.tag_id.split(',').filter(Boolean) : [],
      pcsPrice: r.price_pcs != null ? Number(r.price_pcs) : null,
    }));
  } else if (useKv) {
    const products = await kv.get<Product[]>(KV_KEY);
    const list = Array.isArray(products) ? products : [];
    return list.map((p) => ({ ...p, status: p.status || 'published', pcsPrice: p.pcsPrice ?? null, tagIds: p.tagIds ?? (p.tagId ? [p.tagId] : []) }));
  }
  const fsList = await readFsProducts();
  return fsList.map((p) => ({ ...p, status: p.status || 'published', pcsPrice: p.pcsPrice ?? null, tagIds: p.tagIds ?? (p.tagId ? [p.tagId] : []) }));
}

function normalizePrice(price: number | string): number {
  return typeof price === 'string' ? parseFloat(price) : price;
}

export async function addProduct(input: AddProductInput): Promise<Product> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const newProduct: Product = {
    id: Date.now().toString(),
    ...input,
    price: normalizePrice(input.price),
    description: input.description || '',
    image: input.image || 'https://placehold.co/400',
    supplierId: input.supplierId || null,
    tagId: input.tagId || null,
    tagIds: input.tagIds && input.tagIds.length ? input.tagIds : (input.tagId ? [input.tagId] : []),
    categoryId: input.categoryId || null,
    status: 'published',
    pcsPrice: input.pcsPrice != null ? normalizePrice(input.pcsPrice) : null,
  };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO products (id, title, price, price_pcs, description, image, supplier_id, tag_id, category_id, status)
      VALUES (${newProduct.id}, ${newProduct.title}, ${newProduct.price}, ${newProduct.pcsPrice}, ${newProduct.description}, ${newProduct.image}, ${newProduct.supplierId}, ${(newProduct.tagIds || []).join(',')}, ${newProduct.categoryId}, ${newProduct.status})
    `;
  } else if (useKv) {
    const products = await getProducts();
    const updated = [...products, newProduct];
    await kv.set(KV_KEY, updated);
  } else {
    const products = await getProducts();
    const updated = [...products, newProduct];
    await writeFsProducts(updated);
  }
  return newProduct;
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const updatedProduct: Product = {
    ...input,
    price: normalizePrice(input.price),
    description: input.description || '',
    image: input.image || 'https://placehold.co/400',
    supplierId: input.supplierId || null,
    tagId: input.tagId || null,
    tagIds: input.tagIds && input.tagIds.length ? input.tagIds : (input.tagId ? [input.tagId] : []),
    categoryId: input.categoryId || null,
    pcsPrice: input.pcsPrice != null ? normalizePrice(input.pcsPrice) : null,
  };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      UPDATE products
      SET title = ${updatedProduct.title},
          price = ${updatedProduct.price},
          price_pcs = ${updatedProduct.pcsPrice},
          description = ${updatedProduct.description},
          image = ${updatedProduct.image},
          supplier_id = ${updatedProduct.supplierId},
          tag_id = ${(updatedProduct.tagIds || []).join(',')},
          category_id = ${updatedProduct.categoryId}
      WHERE id = ${updatedProduct.id}
    `;
    // Neon returns void for UPDATE via serverless driver; we trust the operation
  } else if (useKv) {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === updatedProduct.id);
    if (index === -1) throw new Error('Product not found');
    const updated = [...products];
    updated[index] = updatedProduct;
    await kv.set(KV_KEY, updated);
  } else {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === updatedProduct.id);
    if (index === -1) throw new Error('Product not found');
    const updated = [...products];
    updated[index] = updatedProduct;
    await writeFsProducts(updated);
  }
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  if (useDb && sql) {
    await ensureTable();
    await sql`
      DELETE FROM products
      WHERE id = ${id}
    `;
    // No rowCount available; perform a subsequent existence check
    const rows = await sql`
      SELECT id FROM products WHERE id = ${id}
    ` as unknown as { id: string }[];
    return rows.length === 0;
  } else if (useKv) {
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    await kv.set(KV_KEY, filtered);
    return true;
  } else {
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    await writeFsProducts(filtered);
    return true;
  }
}

export async function setProductStatus(id: string, status: 'published' | 'archived'): Promise<Product | null> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  if (useDb && sql) {
    await ensureTable();
    await sql`
      UPDATE products
      SET status = ${status}
      WHERE id = ${id}
    `;
    const rows = await sql`
      SELECT id, title, price, description, image, status, supplier_id as "supplierId", tag_id as "tagId"
      FROM products
      WHERE id = ${id}
    ` as unknown as Array<Product & { price: number | string }>;
    if (!rows.length) return null;
    const r = rows[0];
    return { ...r, price: Number(r.price), status: (r.status || 'published') as 'published' | 'archived' };
  } else if (useKv) {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = [...products];
    updated[index] = { ...updated[index], status };
    await kv.set(KV_KEY, updated);
    return updated[index];
  } else {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = [...products];
    updated[index] = { ...updated[index], status };
    await writeFsProducts(updated);
    return updated[index];
  }
}

export async function getSuppliers(): Promise<Supplier[]> {
  if (useDb && sql) {
    await ensureTable();
    const rows = await sql`
      SELECT id, name FROM suppliers ORDER BY name
    ` as unknown as Supplier[];
    return rows;
  } else if (useKv) {
    const suppliers = await kv.get<Supplier[]>(KV_SUPPLIERS_KEY);
    return Array.isArray(suppliers) ? suppliers : [];
  }
  return readFsSuppliers();
}

export async function addSupplier(name: string): Promise<Supplier> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const supplier: Supplier = { id: Date.now().toString(), name };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO suppliers (id, name) VALUES (${supplier.id}, ${supplier.name})
      ON CONFLICT (name) DO NOTHING
    `;
    return supplier;
  } else if (useKv) {
    const list = await getSuppliers();
    const exists = list.find((s) => s.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, supplier];
    await kv.set(KV_SUPPLIERS_KEY, updated);
    return supplier;
  } else {
    const list = await getSuppliers();
    const exists = list.find((s) => s.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, supplier];
    await writeFsSuppliers(updated);
    return supplier;
  }
}

export async function getTags(): Promise<Tag[]> {
  if (useDb && sql) {
    await ensureTable();
    const rows = await sql`
      SELECT id, name FROM tags ORDER BY name
    ` as unknown as Tag[];
    return rows;
  } else if (useKv) {
    const tags = await kv.get<Tag[]>(KV_TAGS_KEY);
    return Array.isArray(tags) ? tags : [];
  }
  return readFsTags();
}

export async function addTag(name: string): Promise<Tag> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const tag: Tag = { id: Date.now().toString(), name };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO tags (id, name) VALUES (${tag.id}, ${tag.name})
      ON CONFLICT (name) DO NOTHING
    `;
    return tag;
  } else if (useKv) {
    const list = await getTags();
    const exists = list.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, tag];
    await kv.set(KV_TAGS_KEY, updated);
    return tag;
  } else {
    const list = await getTags();
    const exists = list.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, tag];
    await writeFsTags(updated);
    return tag;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (useDb && sql) {
    await ensureTable();
    const rows = await sql`
      SELECT id, name FROM categories ORDER BY name
    ` as unknown as Category[];
    return rows;
  } else if (useKv) {
    const cats = await kv.get<Category[]>(KV_CATEGORIES_KEY);
    return Array.isArray(cats) ? cats : [];
  }
  return readFsCategories();
}

export async function addCategory(name: string): Promise<Category> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const cat: Category = { id: Date.now().toString(), name };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO categories (id, name) VALUES (${cat.id}, ${cat.name})
      ON CONFLICT (name) DO NOTHING
    `;
    return cat;
  } else if (useKv) {
    const list = await getCategories();
    const exists = list.find((c) => c.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, cat];
    await kv.set(KV_CATEGORIES_KEY, updated);
    return cat;
  } else {
    const list = await getCategories();
    const exists = list.find((c) => c.name.toLowerCase() === name.toLowerCase());
    const updated = exists ? list : [...list, cat];
    await writeFsCategories(updated);
    return cat;
  }
}

export async function getSales(): Promise<Salesperson[]> {
  if (useDb && sql) {
    await ensureTable();
    const rows = await sql`
      SELECT id, name, phone FROM salespeople ORDER BY name
    ` as unknown as Salesperson[];
    return rows;
  } else if (useKv) {
    const list = await kv.get<Salesperson[]>(KV_SALES_KEY);
    return Array.isArray(list) ? list : [];
  }
  return readFsSales();
}

export async function addSalesperson(name: string, phone: string): Promise<Salesperson> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const sales: Salesperson = { id: Date.now().toString(), name, phone };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO salespeople (id, name, phone) VALUES (${sales.id}, ${sales.name}, ${sales.phone})
      ON CONFLICT (name) DO NOTHING
    `;
    return sales;
  } else if (useKv) {
    const list = await getSales();
    const exists = list.find((s) => s.name.toLowerCase() === name.toLowerCase() || s.phone === phone);
    const updated = exists ? list : [...list, sales];
    await kv.set(KV_SALES_KEY, updated);
    return sales;
  } else {
    const list = await getSales();
    const exists = list.find((s) => s.name.toLowerCase() === name.toLowerCase() || s.phone === phone);
    const updated = exists ? list : [...list, sales];
    await writeFsSales(updated);
    return sales;
  }
}
