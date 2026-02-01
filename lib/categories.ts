import db from './db';
import { Product } from './products';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  product_count?: number;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await db('categories').where({ slug }).first();
  return category || null;
}

export async function getProductsByCategory(categoryId: number, limit = 12): Promise<Product[]> {
  const products = await db('products')
    .join('product_n_category', 'products.id', 'product_n_category.product_id')
    .where('product_n_category.category_id', categoryId)
    .where('products.status', 1) // Assuming 1 is active
    .select('products.*')
    .limit(limit);

  return products;
}

export async function getAllCategories(): Promise<Category[]> {
  const categories = await db('categories')
    .select('categories.*')
    .count('product_n_category.product_id as product_count')
    .leftJoin('product_n_category', 'categories.id', 'product_n_category.category_id')
    .groupBy('categories.id');

  return categories;
}
