
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

  if (!token) {
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { value } = token;
    const decoded = jwt.verify(value, JWT_SECRET);

    return NextResponse.json(
      { user: decoded },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}
