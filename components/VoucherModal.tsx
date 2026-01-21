
'use client';

import { useState, useEffect } from 'react';
import { X, Ticket, Copy, Check } from 'lucide-react';

interface Promotion {
    id: number;
    code: string;
    discount: number;
    type: 'percent' | 'fixed';
    min_amount: number;
    max_amount: number | null;
    expired_time: string | null;
    is_free_ship: number;
    number_product: number;
}

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (code: string) => void;
    cartTotal: number;
}

export default function VoucherModal({ isOpen, onClose, onSelect, cartTotal }: VoucherModalProps) {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPromotions();
        }
    }, [isOpen]);

    async function fetchPromotions() {
        setLoading(true);
        try {
            const res = await fetch('/api/promotions');
            if (res.ok) {
                const data = await res.json();
                setPromotions(data.promotions);
            }
        } catch (error) {
            console.error('Error fetching promotions', error);
        } finally {
            setLoading(false);
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price).replace('₫', 'đ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#fdfcf8] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-scale-up shadow-2xl border border-[#eaddcf]">
                <div className="p-5 border-b border-[#eaddcf] flex justify-between items-center bg-[#fdfcf8]">
                    <h3 className="font-serif font-bold text-xl flex items-center gap-2 text-[#5d4037]">
                        <Ticket className="text-[#c4a47c]" size={24} />
                        Kho Voucher
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#f5f5f0] rounded-full transition-colors text-[#8d7f71]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 bg-[#f5f5f0] space-y-3">
                    {loading ? (
                         <div className="text-center py-12 text-[#8d7f71]">
                             <div className="w-8 h-8 border-2 border-[#c4a47c] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                             Đang tải ưu đãi...
                         </div>
                    ) : promotions.length > 0 ? (
                        promotions.map((promo) => {
                            const isEligible = cartTotal >= promo.min_amount;
                            return (
                                <div 
                                    key={promo.id} 
                                    className={`relative flex transition-all duration-300 group ${
                                        !isEligible ? 'opacity-60 grayscale-[0.8]' : 'hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer'
                                    }`}
                                    onClick={() => isEligible && onSelect(promo.code)}
                                >
                                     {/* Left part - Ticket Stub */}
                                    <div className={`w-24 flex flex-col items-center justify-center p-2 text-white shrink-0 relative rounded-l-xl overflow-hidden ${
                                        isEligible ? 'bg-[#8B5E3C]' : 'bg-[#a89f91]'
                                    }`}>
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f5f5f0] rounded-full"></div>
                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f5f5f0] rounded-full z-10"></div>
                                        
                                        <span className="font-medium text-[10px] tracking-wider uppercase opacity-90 mb-1">Giảm</span>
                                        
                                        <div className="flex items-baseline justify-center">
                                            <span className="font-bold text-3xl font-serif leading-none shadow-sm drop-shadow-md">
                                                {promo.type === 'percent' ? Number(promo.discount) : (promo.discount / 1000)}
                                            </span>
                                            <span className="font-bold text-sm ml-0.5 opacity-90">
                                                {promo.type === 'percent' ? '%' : 'k'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Right part - Details */}
                                    <div className="flex-1 p-3 bg-white rounded-r-xl border border-l-0 border-[#eaddcf] flex flex-col justify-center relative">
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f5f5f0] rounded-full border-r border-[#eaddcf] z-0"></div>
                                        
                                        <div className="flex justify-between items-start pl-2">
                                            <span className="font-bold text-[#5d4037] text-lg tracking-tight font-serif">{promo.code}</span>
                                            {isEligible && (
                                                <span className="text-xs font-bold text-[#c4a47c] bg-[#c4a47c]/10 px-2 py-1 rounded-full group-hover:bg-[#c4a47c] group-hover:text-white transition-colors">
                                                    Chọn
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="pl-2 mt-1">
                                            {promo.is_free_ship === 1 ? (
                                                <div className="text-sm font-bold text-[#c4a47c] uppercase mb-1">
                                                    Miễn phí vận chuyển
                                                </div>
                                            ) : (
                                                <div className="text-sm text-[#8d7f71]">
                                                    Đơn tối thiểu {formatPrice(promo.min_amount)}
                                                </div>
                                            )}
                                            
                                            {promo.max_amount && (
                                                <div className="text-xs text-[#8d7f71]">
                                                    Giảm tối đa {formatPrice(promo.max_amount)}
                                                </div>
                                            )}

                                            {promo.number_product > 0 && (
                                                <div className="text-xs text-[#8d7f71]">
                                                    Áp dụng khi mua từ {promo.number_product} sản phẩm
                                                </div>
                                            )}

                                            {!isEligible && (
                                                <div className="text-[10px] text-red-500 mt-1 font-medium italic">
                                                    Thêm {formatPrice(promo.min_amount - cartTotal)} để sử dụng
                                                </div>
                                            )}
                                            {promo.expired_time && (
                                                 <div className="text-[10px] text-[#b0a69b] mt-1.5 flex items-center gap-1">
                                                    <span>HSD:</span>
                                                    {new Date(promo.expired_time).toLocaleDateString('vi-VN')}
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : ( 
                        <div className="text-center py-12 flex flex-col items-center text-[#8d7f71]">
                            <Ticket size={48} className="text-[#eaddcf] mb-3" />
                            <p>Chưa có mã giảm giá nào</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-[#eaddcf] bg-white">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-[#f5f5f0] hover:bg-[#eaddcf] text-[#5d4037] font-medium rounded-xl transition-colors uppercase tracking-wide text-sm"
                    >
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
}
