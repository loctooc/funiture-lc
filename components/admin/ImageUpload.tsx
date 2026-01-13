'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
}

export default function ImageUpload({ value, onChange, disabled, multiple = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Process files one by one or in parallel
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        const data = await res.json();
        return data.url;
      });

      const results = await Promise.all(uploadPromises);
      
      if (multiple) {
          onChange(results);
      } else {
          onChange(results[0]);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image(s)');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-4 w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-all
          min-h-[200px] flex flex-col items-center justify-center gap-2 cursor-pointer
          ${value ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={disabled || isUploading}
          multiple={multiple}
        />

        {isUploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">Uploading {multiple ? 'images' : 'image'}...</span>
          </div>
        ) : value ? (
          <div className="relative w-full h-[200px] group">
            <div className="absolute top-0 right-0 z-10 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="bg-white/80 hover:bg-white text-red-600 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 hover:text-blue-500">
            <Upload className="w-8 h-8 mb-2" />
            <span className="font-medium text-sm">Click to upload {multiple ? 'images' : 'image'}</span>
            <span className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</span>
          </div>
        )}
      </div>
    </div>
  );
}
