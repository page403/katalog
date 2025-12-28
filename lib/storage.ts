import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';
import { neon } from '@neondatabase/serverless';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
}

export type AddProductInput = {
  title: string;
  price: number | string;
  description: string;
  image: string;
};

export type UpdateProductInput = {
  id: string;
  title: string;
  price: number | string;
  description: string;
  image: string;
};

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');
const kvReady = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const dbReady = !!dbUrl;
const sql = dbReady ? neon(dbUrl as string) : null;
const useDb = !!process.env.VERCEL && dbReady;
const useKv = !!process.env.VERCEL && !dbReady && kvReady;
const vercelWithoutStorage = !!process.env.VERCEL && !dbReady && !kvReady;
const KV_KEY = 'products';

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

async function ensureTable() {
  if (!useDb || !sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL
    )
  `;
}

export async function getProducts(): Promise<Product[]> {
  if (useDb && sql) {
    await ensureTable();
    type DbProductRow = { id: string; title: string; price: number | string; description: string; image: string };
    const rows = await sql`
      SELECT id, title, price, description, image
      FROM products
      ORDER BY title
    ` as unknown as DbProductRow[];
    return rows.map((r) => ({
      ...r,
      price: Number(r.price),
    }));
  } else if (useKv) {
    const products = await kv.get<Product[]>(KV_KEY);
    return Array.isArray(products) ? products : [];
  }
  return readFsProducts();
}

function normalizePrice(price: number | string): number {
  return typeof price === 'string' ? parseFloat(price) : price;
}

export async function addProduct(input: AddProductInput): Promise<Product> {
  if (vercelWithoutStorage) {
    throw new Error('Storage not configured on Vercel. Set Neon Postgres or Vercel KV environment variables.');
  }
  const products = await getProducts();
  const newProduct: Product = {
    id: Date.now().toString(),
    ...input,
    price: normalizePrice(input.price),
  };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      INSERT INTO products (id, title, price, description, image)
      VALUES (${newProduct.id}, ${newProduct.title}, ${newProduct.price}, ${newProduct.description}, ${newProduct.image})
    `;
  } else if (useKv) {
    const updated = [...products, newProduct];
    await kv.set(KV_KEY, updated);
  } else {
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
  };
  if (useDb && sql) {
    await ensureTable();
    await sql`
      UPDATE products
      SET title = ${updatedProduct.title},
          price = ${updatedProduct.price},
          description = ${updatedProduct.description},
          image = ${updatedProduct.image}
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
