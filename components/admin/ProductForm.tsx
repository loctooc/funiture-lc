'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import MultiSelect from './MultiSelect';
import RichTextEditor from './RichTextEditor';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image: string;
  description: string;
  content: string;
  inventory: number;
  status: number;
  is_featured: boolean;
  categoryIds: number[];
  galleryImages: string[];
}

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ProductForm({ initialData, categories, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: '',
    slug: '',
    price: 0,
    sale_price: null,
    image: '',
    description: '',
    content: '',
    inventory: 0,
    status: 1, // 1 = Active, 0 = Inactive
    is_featured: false,
    categoryIds: [],
    galleryImages: [],
  });
  
  // Local state for formatted currency inputs
  const [priceDisplay, setPriceDisplay] = useState('');
  const [salePriceDisplay, setSalePriceDisplay] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        categoryIds: initialData.categoryIds || [],
        galleryImages: initialData.galleryImages || [],
      });
      setPriceDisplay(formatCurrency(initialData.price));
      setSalePriceDisplay(initialData.sale_price ? formatCurrency(initialData.sale_price) : '');
    } else {
        setFormData({
            name: '',
            slug: '',
            price: 0,
            sale_price: null,
            image: '',
            description: '',
            content: '',
            inventory: 0,
            status: 1,
            is_featured: false,
            categoryIds: [],
            galleryImages: [],
        });
        setPriceDisplay('');
        setSalePriceDisplay('');
    }
  }, [initialData]);
  
  const slugify = (text: string) => {
      return text.toString().toLowerCase()
        .normalize('NFD') // Split accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/đ/g, 'd') // specific handler for 'đ'
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
  };

  const formatCurrency = (value: number | string) => {
    if (!value && value !== 0) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, ''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => {
        let newValue: any = value;
        if (type === 'number') {
            newValue = value === '' ? 0 : parseFloat(value);
        } else if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        }

        const newData = { ...prev, [name]: newValue };
        if (name === 'name' && !initialData?.id) { // Only auto-slug on create or manual name change if desired
            newData.slug = slugify(value);
        }
        return newData;
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'price' | 'sale_price') => {
      const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric chars
      const formatted = formatCurrency(value);
      
      if (field === 'price') {
          setPriceDisplay(formatted);
          const numValue = value ? parseFloat(value) : 0;
          setFormData(prev => ({ ...prev, price: numValue }));
      } else {
          setSalePriceDisplay(formatted);
           const numValue = value ? parseFloat(value) : null;
          setFormData(prev => ({ ...prev, sale_price: numValue }));
      }
  };

  const handleGalleryAdd = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...urls]
    }));
  };

  const handleGalleryRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
             <input
               type="text"
               name="slug"
               value={formData.slug}
               onChange={handleChange}
               required
               className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-600"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                <div className="relative">
                    <input
                        type="text"
                        value={priceDisplay}
                        onChange={(e) => handlePriceChange(e, 'price')}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">đ</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                <div className="relative">
                    <input
                        type="text"
                        value={salePriceDisplay}
                        onChange={(e) => handlePriceChange(e, 'sale_price')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">đ</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                <input
                    type="number"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Dừng hoạt động</option>
                </select>
            </div>
          </div>
            
          <MultiSelect
            label="Danh mục"
            options={categories}
            selectedIds={formData.categoryIds}
            onChange={(ids) => setFormData(prev => ({ ...prev, categoryIds: ids }))}
            disabled={isLoading}
          />
          
          <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Sản phẩm nổi bật?</label>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
             <textarea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
             />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh chính</label>
                <ImageUpload
                    value={formData.image}
                    onChange={(url) => {
                        if (typeof url === 'string') {
                             setFormData(prev => ({ ...prev, image: url }));
                        }
                    }}
                    disabled={isLoading}
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Thư viện ảnh</label>
                 <div className="grid grid-cols-3 gap-2 mb-2">
                    {formData.galleryImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group">
                            <img src={img} alt="gallery" className="w-full h-full object-cover" />
                             <button
                                type="button"
                                onClick={() => handleGalleryRemove(idx)}
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div className="aspect-square">
                        <ImageUpload
                            value=""
                            onChange={(url) => {
                                if (Array.isArray(url)) {
                                    handleGalleryAdd(url);
                                } else {
                                    handleGalleryAdd([url]);
                                }
                            }}
                            disabled={isLoading}
                            multiple
                        />
                    </div>
                 </div>
            </div>
        </div>
      </div>

     {/* Full Width Layout for Content */}
     <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
         <RichTextEditor
           value={formData.content}
           onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
         />
     </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Lưu"}
        </button>
      </div>
    </form>
  );
}
