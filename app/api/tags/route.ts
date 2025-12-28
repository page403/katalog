import { NextResponse } from 'next/server';
import { getTags, addTag } from '@/lib/storage';

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json({ error: 'Failed to load tags' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing tag name' }, { status: 400 });
    }
    const tag = await addTag(name.trim());
    return NextResponse.json(tag, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

