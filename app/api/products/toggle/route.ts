import { NextResponse } from 'next/server';
import { setProductStatus } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: 'published' | 'archived' };
    if (!id || !status || !['published', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Missing id or invalid status' }, { status: 400 });
    }
    const updated = await setProductStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

