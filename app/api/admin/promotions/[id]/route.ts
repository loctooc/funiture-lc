
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
        const { id } = await params;
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const promotion = await db('promotions').where('id', id).first();
        if (!promotion) {
            return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
        }

        return NextResponse.json({ promotion });
    } catch (error) {
        console.error('Admin get promotion error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            code, discount, type, min_amount, max_amount, 
            expired_time, limit, is_free_ship, number_product, status 
        } = body;

        // Check exists
        const existing = await db('promotions').where('id', id).first();
        if (!existing) {
            return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
        }

        // Check duplicate code if changed
        if (code && code !== existing.code) {
            const duplicate = await db('promotions').where('code', code).whereNot('id', id).first();
            if (duplicate) {
                return NextResponse.json({ message: 'Promotion code already exists' }, { status: 400 });
            }
        }

        const typeToCheck = type !== undefined ? type : existing.type;
        const discountToCheck = discount !== undefined ? discount : existing.discount;

        if (typeToCheck === 'percent' && (discountToCheck < 1 || discountToCheck > 99)) {
            return NextResponse.json({ message: 'Discount percent must be between 1 and 99' }, { status: 400 });
        }

        await db('promotions').where('id', id).update({
            code: code !== undefined ? code : existing.code,
            discount: discount !== undefined ? discount : existing.discount,
            type: type !== undefined ? type : existing.type,
            min_amount: min_amount !== undefined ? min_amount : existing.min_amount,
            max_amount: max_amount !== undefined ? max_amount : existing.max_amount,
            expired_time: expired_time ? new Date(expired_time) : existing.expired_time,
            limit: limit !== undefined ? limit : existing.limit,
            is_free_ship: is_free_ship !== undefined ? (is_free_ship ? 1 : 0) : existing.is_free_ship,
            number_product: number_product !== undefined ? number_product : existing.number_product,
            status: status !== undefined ? status : existing.status,
            updated_at: new Date()
        });

        return NextResponse.json({ success: true, message: 'Promotion updated' });
    } catch (error) {
        console.error('Admin update promotion error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const existing = await db('promotions').where('id', id).first();
        if (!existing) {
            return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
        }

        await db('promotions').where('id', id).del();

        return NextResponse.json({ success: true, message: 'Promotion deleted' });
    } catch (error) {
        console.error('Admin delete promotion error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
