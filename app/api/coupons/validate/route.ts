import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code, orderValue } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Please provide a coupon code' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ success: false, message: 'Coupon code has expired' }, { status: 400 });
    }

    const subtotal = Number(orderValue) || 0;
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description,
      },
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ success: false, message: 'Error validating coupon' }, { status: 500 });
  }
}
