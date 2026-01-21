
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where('id', decoded.userId).first();
    if (user && user.role === 'admin') {
        return user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await db('orders').where('id', id).first();

    if (!order) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // items
    const items = await db('order_items')
        .join('products', 'order_items.product_id', 'products.id')
        .where('order_items.order_id', id)
        .select(
            'order_items.*',
            'products.name as product_name',
            'products.image as product_image',
            'products.slug as product_slug'
        );

    // promotion
    let promotion = null;
    if (order.promotion_code) {
        promotion = await db('promotions').where('code', order.promotion_code).first();
    }

    return NextResponse.json({
        order: {
            ...order,
            items,
            promotion_details: promotion
        }
    });

  } catch (error) {
    console.error('Admin get order detail error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const allowedStatuses = ['pending', 'confirmed', 'processing', 'ready_to_ship', 'delivering', 'finished', 'request_refund', 'refunded', 'cancelled'];
        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await db('orders').where('id', id).update({ 
            status, 
            updated_at: new Date() 
        });

        return NextResponse.json({ success: true, message: 'Order status updated' });

    } catch (error) {
        console.error('Admin update order status error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
