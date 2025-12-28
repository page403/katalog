import { NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/storage';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
    }
    const category = await addCategory(name.trim());
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

