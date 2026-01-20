
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

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart_session')?.value;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const sessionId = await getSessionId();
    
    // Get Cart
    let cart;
    if (userId) {
      cart = await db('carts').where('user_id', userId).where('status', 'pending').first();
    } else if (sessionId) {
      cart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
    }

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 400 });
    }

    const cartItems = await db('cart_items')
        .join('products', 'cart_items.product_id', 'products.id')
        .where('cart_items.cart_id', cart.id)
        .select(
            'cart_items.product_id',
            'cart_items.quantity',
            'products.price',
            'products.sale_price',
            'products.slug' // taking slug as sku for simplicity if sku not available
        );

    if (cartItems.length === 0) {
        return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const body = await request.json();
    const { name, phone, email, address, province_id, district_id, commune_id, note } = body;

    // Calculate totals
    let totalAmount = 0;
    const orderItemsData = cartItems.map((item: any) => {
        const price = item.sale_price || item.price;
        const amount = price * item.quantity;
        totalAmount += amount;
        return {
            product_id: item.product_id,
            product_sku: item.slug, // using slug as SKU equivalent
            price: price,
            quantity: item.quantity,
            amount: amount
        };
    });

    // Create Order Code (unique)
    const orderCode = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Transaction
    const orderId = await db.transaction(async (trx) => {
        const [id] = await trx('orders').insert({
            user_id: userId || null, // Can be null for guest
            name,
            phone,
            email,
            address,
            province_id,
            district_id,
            commune_id,
            code: orderCode,
            status: 'pending',
            amount: totalAmount,
            discount: 0,
            shipping_fee: 0, // Logic for shipping fee can be added here
            note,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Insert Order Items
        const itemsToInsert = orderItemsData.map((item: any) => ({
            ...item,
            order_id: id,
            created_at: new Date(),
            updated_at: new Date()
        }));
        await trx('order_items').insert(itemsToInsert);

        // Update Cart Status
        await trx('carts').where('id', cart.id).update({ status: 'ordered', updated_at: new Date() });

        return id;
    });

    return NextResponse.json({ success: true, orderId, orderCode });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db('orders')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .select('*');
        
    // Fetch items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
        const items = await db('order_items')
            .join('products', 'order_items.product_id', 'products.id')
            .where('order_items.order_id', order.id)
            .select(
                'order_items.id',
                'order_items.quantity',
                'order_items.price',
                'products.name',
                'products.image',
                'products.slug'
            );
        return { ...order, items };
    }));
    
    return NextResponse.json({ orders: ordersWithItems });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
