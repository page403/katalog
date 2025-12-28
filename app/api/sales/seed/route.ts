import { NextResponse } from 'next/server';
import { addSalesperson } from '@/lib/storage';

export async function POST() {
  try {
    const result = await addSalesperson('Wahid', '62895346372918');
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed sales' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await addSalesperson('Wahid', '62895346372918');
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed sales' }, { status: 500 });
  }
}
