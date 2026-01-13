import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  try {
    // Fetch products with their categories
    const products = await db('products')
      .select(
        'products.*',
        db.raw('GROUP_CONCAT(categories.name) as category_names'),
        db.raw('GROUP_CONCAT(categories.id) as category_ids')
      )
      .leftJoin('product_n_category', 'products.id', 'product_n_category.product_id')
      .leftJoin('categories', 'product_n_category.category_id', 'categories.id')
      .groupBy('products.id')
      .orderBy('products.created_at', 'desc');

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      price,
      sale_price,
      image,
      description,
      content,
      inventory,
      status,
      is_featured,
      categoryIds, // Array of category IDs
      galleryImages, // Array of image URLs
    } = body;

    if (!name || !slug || !price) {
      return NextResponse.json({ error: 'Name, slug, and price are required' }, { status: 400 });
    }

    const result = await db.transaction(async (trx) => {
      // 1. Insert Product
      const [productId] = await trx('products').insert({
        name,
        slug,
        price,
        sale_price: sale_price || null,
        image,
        description,
        content,
        inventory: inventory || 0,
        status: status ? 1 : 0,
        is_featured: is_featured ? 1 : 0,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      // 2. Insert Category Links
      if (categoryIds && categoryIds.length > 0) {
        const categoryInserts = categoryIds.map((catId: number) => ({
          product_id: productId,
          category_id: catId,
          create_time: db.fn.now(),
        }));
        await trx('product_n_category').insert(categoryInserts);
      }

      // 3. Insert Gallery Images
      if (galleryImages && galleryImages.length > 0) {
        const galleryInserts = galleryImages.map((img: string) => ({
          product_id: productId,
          image_url: img,
          create_time: db.fn.now(),
          update_time: db.fn.now(),
        }));
        await trx('product_gallery').insert(galleryInserts);
      }

      return productId;
    });

    const newProduct = await db('products').where({ id: result }).first();
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
