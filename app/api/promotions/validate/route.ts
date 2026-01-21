
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, totalAmount } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const promotion = await db('promotions')
      .where('code', code)
      .where('status', 'active')
      .first();

    if (!promotion) {
      return NextResponse.json({ valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' }, { status: 404 });
    }

    // Check expiry
    if (promotion.expired_time && new Date(promotion.expired_time) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Mã giảm giá đã hết hạn' }, { status: 400 });
    }

    // Check limit usage
    if (promotion.limit > 0 && promotion.number_uses >= promotion.limit) {
      return NextResponse.json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' }, { status: 400 });
    }

    // Check min amount
    if (totalAmount < promotion.min_amount) {
        // Format currency for message
        const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        return NextResponse.json({ 
            valid: false, 
            message: `Đơn hàng tối thiểu để áp dụng mã này là ${formatter.format(promotion.min_amount)}` 
        }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (promotion.type === 'percent') {
        discount = (totalAmount * promotion.discount) / 100;
        if (promotion.max_amount && discount > promotion.max_amount) {
            discount = promotion.max_amount;
        }
    } else {
        discount = promotion.discount;
    }

    // Ensure discount doesn't exceed total
    if (discount > totalAmount) {
        discount = totalAmount;
    }

    return NextResponse.json({ 
        valid: true, 
        discount, 
        promotion: {
            code: promotion.code,
            type: promotion.type,
            value: promotion.discount
        },
        message: 'Áp dụng mã giảm giá thành công' 
    });

  } catch (error) {
    console.error('Validate promotion error:', error);
    return NextResponse.json({ valid: false, message: 'Lỗi server' }, { status: 500 });
  }
}
