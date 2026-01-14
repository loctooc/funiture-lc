
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Find user
    const users = await db('users').where('email', email);
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Sync Cart
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (sessionId) {
       // Find guest cart
       const guestCart = await db('carts').where('session_id', sessionId).where('status', 'pending').first();
       
       if (guestCart) {
          // Find user cart
          const userCart = await db('carts').where('user_id', user.id).where('status', 'pending').first();

          if (userCart) {
             // Merge items
             const guestItems = await db('cart_items').where('cart_id', guestCart.id);
             
             for (const item of guestItems) {
                const existingItem = await db('cart_items')
                   .where('cart_id', userCart.id)
                   .where('product_id', item.product_id)
                   .first();
                
                if (existingItem) {
                   await db('cart_items')
                     .where('id', existingItem.id)
                     .update({ quantity: existingItem.quantity + item.quantity });
                } else {
                   await db('cart_items').insert({
                      ...item,
                      id: undefined, // Let DB generate ID
                      cart_id: userCart.id
                   });
                }
             }
             // Delete guest cart items and cart
             await db('cart_items').where('cart_id', guestCart.id).delete();
             await db('carts').where('id', guestCart.id).delete();
          } else {
             // Assign guest cart to user
             await db('carts').where('id', guestCart.id).update({ user_id: user.id, session_id: null });
          }
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
      { message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      {
        status: 200,
        headers: { 'Set-Cookie': serialized },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
