
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const promotions = await db('promotions')
      .where('status', 'active')
      .andWhere(function() {
        this.whereNull('expired_time').orWhere('expired_time', '>', new Date());
      })
      .select('*');

    return NextResponse.json(
      { promotions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
