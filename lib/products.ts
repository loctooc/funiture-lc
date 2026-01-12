import db from './db';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image: string;
  inventory: number;
  status: number;
  content: string;
  is_featured: boolean;
  categories: { id: number; name: string; slug: string }[];
  gallery: { id: number; image_url: string }[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await db('products').where({ slug }).first();

  if (!product) {
    return null;
  }

  // Fetch categories
  const categories = await db('product_n_category')
    .join('categories', 'product_n_category.category_id', 'categories.id')
    .where('product_n_category.product_id', product.id)
    .select('categories.id', 'categories.name', 'categories.slug');

  // Fetch gallery
  const gallery = await db('product_gallery')
    .where('product_id', product.id)
    .select('id', 'image_url');

  return {
    ...product,
    categories,
    gallery,
  };
}

export async function getFeaturedProducts(limit = 4) {
  return db('products')
    .where('is_featured', true)
    .limit(limit);
}
