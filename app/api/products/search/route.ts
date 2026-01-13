import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const products = await db('products')
      .where('name', 'like', `%${q}%`)
      .orWhere('slug', 'like', `%${q}%`)
      .where('status', 1)
      .select('id', 'name', 'slug', 'image', 'price', 'sale_price')
      .limit(limit);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
