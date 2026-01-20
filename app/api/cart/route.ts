
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart_session')?.value;
}

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

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json();
    let sessionId = await getSessionId();
    const userId = await getUserId();
    let newSessionCookie = null;

    if (!sessionId && !userId) {
      sessionId = uuidv4();
      newSessionCookie = serialize('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Find or create cart
    let cart: any;
    if (userId) {
      const carts = await db('carts').where('user_id', userId).where('status', 'pending');
      cart = carts[0];
      if (!cart) {
        const [id] = await db('carts').insert({ user_id: userId, status: 'pending', created_at: new Date() });
        cart = { id };
      }
    } else {
      const carts = await db('carts').where('session_id', sessionId).where('status', 'pending');
      cart = carts[0];
      if (!cart) {
        const [id] = await db('carts').insert({ session_id: sessionId, status: 'pending', created_at: new Date() });
        cart = { id };
      }
    }

    // Check item
    const existingItems = await db('cart_items')
      .where('cart_id', cart.id)
      .where('product_id', productId);
    
    if (existingItems.length > 0) {
      // Update quantity
      await db('cart_items')
        .where('id', existingItems[0].id)
        .update({ 
          quantity: existingItems[0].quantity + quantity,
          updated_at: new Date()
        });
    } else {
      // Add new item
      // Need price from products table
      const product = await db('products').where('id', productId).first();
      const price = product.sale_price || product.price;

      await db('cart_items').insert({
        cart_id: cart.id,
        product_id: productId,
        quantity: quantity,
        price: price,
        is_select: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }


    // Calculate count
    const countResult = await db('cart_items').where('cart_id', cart.id).sum('quantity as total');
    const totalCount = parseInt(countResult[0].total || 0);

    const response = NextResponse.json(
      { message: 'Item added to cart', cartCount: totalCount },
      { status: 200 }
    );

    if (newSessionCookie) {
      response.headers.set('Set-Cookie', newSessionCookie);
    }

    return response;

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    const sessionId = await getSessionId();
    const { searchParams } = new URL(request.url);
    const detail = searchParams.get('detail') === 'true';

    if (!userId && !sessionId) {
       return NextResponse.json({ cartCount: 0, items: [] });
    }

    let cart;
    if (userId) {
      cart = await db('carts').where('user_id', userId).where('status', 'pending').first();
    } else if (sessionId) {
      cart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
    }

    if (!cart) {
      return NextResponse.json({ cartCount: 0, items: [] });
    }

    const countResult = await db('cart_items').where('cart_id', cart.id).sum('quantity as total');
    const totalCount = parseInt(countResult[0].total || 0);

    if (detail) {
      const items = await db('cart_items')
        .join('products', 'cart_items.product_id', 'products.id')
        .where('cart_items.cart_id', cart.id)
        .select(
          'cart_items.id',
          'cart_items.quantity',
          'cart_items.product_id',
          'products.name',
          'products.slug',
          'products.image',
          'products.price',
          'products.sale_price'
        );
      
      return NextResponse.json({ cartCount: totalCount, items });
    }

    return NextResponse.json({ cartCount: totalCount });

  } catch (error) {
     console.error('Get cart error:', error);
     return NextResponse.json({ cartCount: 0, items: [] });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const sessionId = await getSessionId();
    const { itemId, quantity } = await request.json();

    let cart;
    if (userId) {
      cart = await db('carts').where('user_id', userId).where('status', 'pending').first();
    } else if (sessionId) {
      cart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
    }

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }

    await db('cart_items')
      .where('id', itemId)
      .where('cart_id', cart.id)
      .update({ quantity, updated_at: new Date() });
    
    // Recalculate count
    const countResult = await db('cart_items').where('cart_id', cart.id).sum('quantity as total');
    const totalCount = parseInt(countResult[0].total || 0);

    return NextResponse.json({ success: true, cartCount: totalCount });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ message: 'Error updating cart' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    const sessionId = await getSessionId();
    const { itemId } = await request.json();

    let cart;
    if (userId) {
      cart = await db('carts').where('user_id', userId).where('status', 'pending').first();
    } else if (sessionId) {
      cart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
    }

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
    }

    await db('cart_items')
      .where('id', itemId)
      .where('cart_id', cart.id)
      .del();
    
    // Recalculate count
    const countResult = await db('cart_items').where('cart_id', cart.id).sum('quantity as total');
    const totalCount = parseInt(countResult[0].total || 0);

    return NextResponse.json({ success: true, cartCount: totalCount });

  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ message: 'Error deleting item' }, { status: 500 });
  }
}
