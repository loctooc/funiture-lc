import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  try {
    const categories = await db('categories').select('*').orderBy('created_at', 'desc');
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, image, description } = body;

    if (!name || !slug) {
        return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const [id] = await db('categories').insert({
      name,
      slug,
      image,
      description,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    const newCategory = await db('categories').where({ id }).first();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
