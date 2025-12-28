import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

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
const useKv = !!process.env.VERCEL && kvReady;
const vercelWithoutKv = !!process.env.VERCEL && !kvReady;
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

export async function getProducts(): Promise<Product[]> {
  if (useKv) {
    const products = await kv.get<Product[]>(KV_KEY);
    return Array.isArray(products) ? products : [];
  }
  return readFsProducts();
}

function normalizePrice(price: number | string): number {
  return typeof price === 'string' ? parseFloat(price) : price;
}

export async function addProduct(input: AddProductInput): Promise<Product> {
  if (vercelWithoutKv) {
    throw new Error('Storage not configured on Vercel. Set Vercel KV environment variables.');
  }
  const products = await getProducts();
  const newProduct: Product = {
    id: Date.now().toString(),
    ...input,
    price: normalizePrice(input.price),
  };
  const updated = [...products, newProduct];
  if (useKv) {
    await kv.set(KV_KEY, updated);
  } else {
    await writeFsProducts(updated);
  }
  return newProduct;
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  if (vercelWithoutKv) {
    throw new Error('Storage not configured on Vercel. Set Vercel KV environment variables.');
  }
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === input.id);
  if (index === -1) {
    throw new Error('Product not found');
  }
  const updatedProduct: Product = {
    ...input,
    price: normalizePrice(input.price),
  };
  const updated = [...products];
  updated[index] = updatedProduct;
  if (useKv) {
    await kv.set(KV_KEY, updated);
  } else {
    await writeFsProducts(updated);
  }
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (vercelWithoutKv) {
    throw new Error('Storage not configured on Vercel. Set Vercel KV environment variables.');
  }
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) {
    return false;
  }
  if (useKv) {
    await kv.set(KV_KEY, filtered);
  } else {
    await writeFsProducts(filtered);
  }
  return true;
}
