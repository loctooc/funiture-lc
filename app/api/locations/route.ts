
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parent_id');
  const type = searchParams.get('type'); // optional filter if needed

  try {
    let query = db('locations').select('id', 'name', 'type', 'parent_id');

    if (parentId) {
      query = query.where('parent_id', parentId);
    } else {
      // If no parentId, we assume we want provinces (parent_id is null)
      query = query.whereNull('parent_id');
    }
    
    // Optional: filter by type if provided just to be safe, though parent_id logic usually suffices
    if (type) {
        query = query.where('type', type);
    }

    const locations = await query.orderBy('name', 'asc');

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Fetch locations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
