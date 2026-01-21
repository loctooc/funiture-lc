
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

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = db('promotions').orderBy('created_at', 'desc');

    if (search) {
        query = query.where('code', 'like', `%${search}%`);
    }

    // Clone query for count
    const countQuery = query.clone().count('id as total').first();
    const totalResult = await countQuery;
    const total = totalResult ? (totalResult.total as number) : 0;

    const promotions = await query.limit(limit).offset(offset).select('*');

    return NextResponse.json({
        promotions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin get promotions error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            code, discount, type, min_amount, max_amount, 
            expired_time, limit, is_free_ship, number_product, status 
        } = body;

        // Basic validation
        if (!code || discount === undefined || !type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        if (type === 'percent' && (discount < 1 || discount > 99)) {
            return NextResponse.json({ message: 'Discount percent must be between 1 and 99' }, { status: 400 });
        }

        // Check if code exists
        const existing = await db('promotions').where('code', code).first();
        if (existing) {
            return NextResponse.json({ message: 'Promotion code already exists' }, { status: 400 });
        }

        await db('promotions').insert({
            code,
            discount,
            type,
            min_amount: min_amount || 0,
            max_amount: max_amount || null,
            expired_time: expired_time ? new Date(expired_time) : null,
            limit: limit || 0,
            is_free_ship: is_free_ship ? 1 : 0,
            number_product: number_product || 0,
            status: status || 'active',
            created_at: new Date(),
            updated_at: new Date()
        });

        return NextResponse.json({ success: true, message: 'Promotion created' });

    } catch (error) {
        console.error('Admin create promotion error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
