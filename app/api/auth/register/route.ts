import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    // Basic validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db('users').where('email', email);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userId] = await db('users').insert({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Auto-login: Generate JWT
    const token = jwt.sign(
      { userId: userId, email, role: 'customer', name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Sync Cart - For registration, simple assignment if guest cart exists
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (sessionId) {
       const guestCart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
       if (guestCart) {
          // Since it's a new user, they definitely don't have a user cart yet.
          // Just assign guest cart to this new user.
          await db('carts').where('id', guestCart.id).update({ user_id: userId, session_id: null });
       }
    }

    // Set Cookie
    const serialized = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: userId },
      { 
        status: 201,
        headers: { 'Set-Cookie': serialized }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
