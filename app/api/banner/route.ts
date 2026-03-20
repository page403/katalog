import { NextResponse } from 'next/server';
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/lib/storage';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const banner = await addBanner(body);
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error adding banner:', error);
    return NextResponse.json({ error: 'Failed to add banner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const banner = await updateBanner(body);
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }
    const success = await deleteBanner(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
