import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/storage';

export async function GET() {
  try {
    const products = await getProducts();
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

    const newProduct = await addProduct({
      title,
      price: parseFloat(price),
      description,
      image,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, price, description, image } = body;

    if (!id || !title || !price || !description || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const updated = await updateProduct({
        id,
        title,
        price: parseFloat(price),
        description,
        image,
      });
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
