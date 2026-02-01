import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const detail = searchParams.get('detail') === 'true';

    if (detail) {
      const wishlistItems = await db('wishlist')
        .join('products', 'wishlist.product_id', 'products.id')
        .where('wishlist.user_id', userId)
        .select(
           'wishlist.id as wishlist_id',
           'products.id',
           'products.name',
           'products.slug',
           'products.image',
           'products.price',
           'products.sale_price'
        );
      return NextResponse.json({ items: wishlistItems });
    } else {
      const wishlistItems = await db('wishlist')
        .where('user_id', userId)
        .select('product_id');
      return NextResponse.json({ items: wishlistItems.map((item: any) => item.product_id) });
    }
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const existing = await db('wishlist')
      .where({ user_id: userId, product_id: productId })
      .first();

    if (existing) {
      // Remove
      await db('wishlist').where('id', existing.id).del();
      return NextResponse.json({ action: 'removed', message: 'Removed from wishlist' });
    } else {
      // Add
      await db('wishlist').insert({
        user_id: userId,
        product_id: productId,
        created_at: new Date(),
        updated_at: new Date()
      });
      return NextResponse.json({ action: 'added', message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
