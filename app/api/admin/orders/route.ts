
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
    // Verify admin role
    const user = await db('users').where('id', decoded.userId).first();
    if (user && user.role === 'admin') {
        return user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = db('orders').orderBy('created_at', 'desc');

    if (status && status !== 'all') {
        query = query.where('status', status);
    }

    if (search) {
        query = query.where(builder => {
            builder.where('code', 'like', `%${search}%`)
                   .orWhere('phone', 'like', `%${search}%`)
                   .orWhere('name', 'like', `%${search}%`);
        });
    }

    // Clone query for count
    const countQuery = query.clone().count('id as total').first();
    const totalResult = await countQuery;
    const total = totalResult ? (totalResult.total as number) : 0;

    const orders = await query.limit(limit).offset(offset).select('*');

    return NextResponse.json({
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin get orders error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
