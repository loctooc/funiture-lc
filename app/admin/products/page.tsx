'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../../components/admin/Modal';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import ProductForm from '../../../components/admin/ProductForm';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image: string;
  category_names: string;
  category_ids: string;
  inventory: number;
  status: number;
  is_featured: number; // API returns 0/1 from DB, need to convert for form
}

interface Category {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 3;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData);
      setCategories(catData.map((c: any) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductDetails = async (id: number) => {
      try {
          const res = await fetch(`/api/admin/products/${id}`);
          const data = await res.json();
          // Transform for form
          return {
              ...data,
              categoryIds: data.categories.map((c: any) => c.id),
              galleryImages: data.galleryImages,
              is_featured: !!data.is_featured,
          };
      } catch (error) {
          console.error("Failed to fetch details", error);
          return null;
      }
  }

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData(); // Refresh list to get updated group_concat fields
        setIsFormModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create product', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        setIsFormModalOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Failed to update product', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error) {
      console.error('Failed to delete product', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = async (product: Product) => {
    const details = await fetchProductDetails(product.id);
    if (details) {
        setEditingProduct(details);
        setIsFormModalOpen(true);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
  );

  const formatPrice = (price: number) => {
      return Math.floor(price).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Ảnh sản phẩm</th>
                <th className="px-6 py-3">Tên sản phẩm</th>
                <th className="px-6 py-3">Giá</th>
                <th className="px-6 py-3">Danh mục</th>
                <th className="px-6 py-3">Tồn kho</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Đang tải sản phẩm...
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm. 
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                         {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4">
                        {product.sale_price ? (
                            <div className="flex flex-col">
                                <span className="text-red-600 font-medium">{formatPrice(product.sale_price)}</span>
                                <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
                            </div>
                        ) : (
                             <span>{formatPrice(product.price)}</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-wrap gap-1">
                            {product.category_names ? product.category_names.split(',').map((cat, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                                    {cat}
                                </span>
                            )) : '-'}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.inventory}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.status ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(product.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> của <span className="font-medium">{filteredProducts.length}</span> kết quả
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        size="2xl"
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={() => setIsFormModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này?"
        isLoading={isSubmitting}
      />
    </div>
  );
}
