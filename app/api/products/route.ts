import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const products = JSON.parse(fileContents);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, price, description, image } = body;

    if (!title || !price || !description || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const products = JSON.parse(fileContents);

    const newProduct = {
      id: Date.now().toString(),
      title,
      price: parseFloat(price),
      description,
      image,
    };

    products.push(newProduct);
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
