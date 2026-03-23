import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/lib/storage';

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
    const { name, logo } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing supplier name' }, { status: 400 });
    }
    const supplier = await addSupplier(name.trim(), logo);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add supplier';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, logo } = body;
    if (!id || !name) {
      return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });
    }
    const supplier = await updateSupplier({ id, name, logo });
    return NextResponse.json(supplier);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update supplier';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await deleteSupplier(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete supplier';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

