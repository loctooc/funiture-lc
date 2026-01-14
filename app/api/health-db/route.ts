
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const products = await db('products').select('id').limit(1);
    return NextResponse.json({ status: 'ok', products });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
