import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      
      const product = await db('products').where({ id }).first();
      
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
  
      // Fetch associated categories
      const categories = await db('product_n_category')
        .join('categories', 'product_n_category.category_id', 'categories.id')
        .where('product_n_category.product_id', id)
        .select('categories.*');
  
      // Fetch gallery images
      const gallery = await db('product_gallery')
        .where('product_id', id)
        .select('image_url');
  
      return NextResponse.json({
        ...product,
        categories,
        galleryImages: gallery.map((g: any) => g.image_url),
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
    }
  }

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      categoryIds,
      galleryImages,
    } = body;

    await db.transaction(async (trx) => {
      // 1. Update Product
      const updated = await trx('products')
        .where({ id })
        .update({
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
          updated_at: db.fn.now(),
        });

        if (!updated && updated !== 0) { // Check if update was attempted on existing row
           // Note: simple update ref might return 0 if no fields changed, but validation happens before. 
           // Better check existence first or assume id implies existence if routed here.
        }

      // 2. Sync Categories (Delete all, then insert new)
      await trx('product_n_category').where({ product_id: id }).del();
      if (categoryIds && categoryIds.length > 0) {
        const categoryInserts = categoryIds.map((catId: number) => ({
          product_id: id,
          category_id: catId,
          create_time: db.fn.now(),
        }));
        await trx('product_n_category').insert(categoryInserts);
      }

      // 3. Sync Gallery (Delete all, then insert new)
      await trx('product_gallery').where({ product_id: id }).del();
      if (galleryImages && galleryImages.length > 0) {
        const galleryInserts = galleryImages.map((img: string) => ({
          product_id: id,
          image_url: img,
          create_time: db.fn.now(),
          update_time: db.fn.now(),
        }));
        await trx('product_gallery').insert(galleryInserts);
      }
    });

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.transaction(async (trx) => {
      // Delete relationships first (though FK cascade might handle this, manual is safer without knowing DB strictness)
      await trx('product_n_category').where({ product_id: id }).del();
      await trx('product_gallery').where({ product_id: id }).del();
      
      // Delete product
      const deleted = await trx('products').where({ id }).del();

      if (!deleted) {
        throw new Error('Product not found');
      }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
