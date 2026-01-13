'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
  id: number;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  selectedIds,
  onChange,
  label,
  placeholder = 'Select options...',
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2 min-h-[42px] border rounded-lg flex items-center justify-between cursor-pointer bg-white transition-all
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}
        `}
      >
        <div className="flex flex-wrap gap-2">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {opt.name}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
                  onClick={(e) => handleRemove(opt.id, e)}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              >
                <span className="text-gray-700">{opt.name}</span>
                {selectedIds.includes(opt.id) && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}
