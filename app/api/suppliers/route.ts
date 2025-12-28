import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier } from '@/lib/storage';

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers);
  } catch {
    return NextResponse.json({ error: 'Failed to load suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing supplier name' }, { status: 400 });
    }
    const supplier = await addSupplier(name.trim());
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add supplier';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

