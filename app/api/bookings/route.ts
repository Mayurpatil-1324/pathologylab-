import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateBookingRef } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        serviceLocation: true,
        reports: true,
      },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching patient bookings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      patientDetails,
      collectionType,
      scheduledDate,
      slotTime,
      serviceLocationId,
      address,
      couponCode,
      paymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
    }

    if (!patientDetails || !patientDetails.name || !patientDetails.phone || !patientDetails.age) {
      return NextResponse.json({ success: false, message: 'Patient details are required' }, { status: 400 });
    }

    if (!scheduledDate || !slotTime || !serviceLocationId) {
      return NextResponse.json({ success: false, message: 'Scheduling and location details are required' }, { status: 400 });
    }

    if (collectionType === 'HOME_COLLECTION' && (!address || !address.houseNumber || !address.pincode)) {
      return NextResponse.json({ success: false, message: 'Complete address is required for home collection' }, { status: 400 });
    }

    // 1. User identification
    let user = await getCurrentUser();
    if (!user) {
      // Find existing user by phone or email, or create a guest patient account
      const email = patientDetails.email?.toLowerCase().trim() || `patient_${patientDetails.phone.replace(/\D/g, '')}@healthpoint.in`;
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phone: patientDetails.phone }],
        },
      });

      if (!dbUser) {
        // default password for guest checkout
        const bcrypt = await import('bcryptjs');
        const defaultHash = await bcrypt.hash('Patient@123', 10);
        dbUser = await prisma.user.create({
          data: {
            name: patientDetails.name,
            email,
            phone: patientDetails.phone,
            passwordHash: defaultHash,
            role: 'PATIENT',
            profile: {
              create: {
                gender: patientDetails.gender,
              },
            },
          },
        });
      }

      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role as any,
      };
    }

    // 2. Server-side Price Verification (Never trust prices submitted by client)
    let calculatedSubtotal = 0;
    const verifiedBookingItems: {
      itemType: string;
      testId?: string | null;
      packageId?: string | null;
      itemName: string;
      itemCode?: string | null;
      priceCharged: number;
      sampleType?: string | null;
    }[] = [];

    for (const item of items) {
      if (item.itemType === 'TEST' && item.testId) {
        const dbTest = await prisma.diagnosticTest.findUnique({
          where: { id: item.testId },
        });
        if (!dbTest || !dbTest.isActive) {
          return NextResponse.json({ success: false, message: `Test ${item.name} is no longer available` }, { status: 400 });
        }
        calculatedSubtotal += dbTest.sellingPrice;
        verifiedBookingItems.push({
          itemType: 'TEST',
          testId: dbTest.id,
          itemName: dbTest.name,
          itemCode: dbTest.testCode,
          priceCharged: dbTest.sellingPrice,
          sampleType: dbTest.sampleType,
        });
      } else if (item.itemType === 'PACKAGE' && item.packageId) {
        const dbPackage = await prisma.healthPackage.findUnique({
          where: { id: item.packageId },
        });
        if (!dbPackage || !dbPackage.isActive) {
          return NextResponse.json({ success: false, message: `Package ${item.name} is no longer available` }, { status: 400 });
        }
        calculatedSubtotal += dbPackage.sellingPrice;
        verifiedBookingItems.push({
          itemType: 'PACKAGE',
          packageId: dbPackage.id,
          itemName: dbPackage.name,
          priceCharged: dbPackage.sellingPrice,
          sampleType: 'Blood & Urine',
        });
      }
    }

    // 3. Server-side Coupon Calculation
    let calculatedDiscount = 0;
    let couponRecord = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil && calculatedSubtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'PERCENTAGE') {
            calculatedDiscount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
              calculatedDiscount = coupon.maxDiscount;
            }
          } else {
            calculatedDiscount = coupon.discountValue;
          }
          calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
          couponRecord = coupon;
        }
      }
    }

    // 4. Collection Fee
    const isHome = collectionType === 'HOME_COLLECTION';
    const collectionFee = isHome ? (calculatedSubtotal >= 499 ? 0 : 99) : 0;
    const finalAmount = Math.max(0, calculatedSubtotal - calculatedDiscount + collectionFee);

    // 5. Slot Capacity Check
    const targetDate = new Date(scheduledDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

    const slotConfig = await prisma.collectionSlot.findFirst({
      where: {
        serviceLocationId,
        isActive: true,
      },
    });

    const existingCount = await prisma.booking.count({
      where: {
        serviceLocationId,
        slotTime,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['CANCELLED'] },
      },
    });

    const maxCapacity = slotConfig ? slotConfig.capacity : 8;
    if (existingCount >= maxCapacity) {
      return NextResponse.json({
        success: false,
        message: 'Selected time slot is fully booked. Please select another slot.',
      }, { status: 400 });
    }

    // 6. Address snapshot string
    let addressString = null;
    if (isHome && address) {
      addressString = `${address.houseNumber}, ${address.street || ''}, ${address.area || ''}, ${address.city || ''} - ${address.pincode} ${address.landmark ? `(Landmark: ${address.landmark})` : ''}`.replace(/\s+/g, ' ').trim();
    }

    // 7. Payment status
    const isOnline = paymentMethod === 'ONLINE';
    const paymentStatus = isOnline ? 'PAID' : 'PENDING';
    const paymentId = isOnline ? `pay_demo_${Date.now()}` : null;

    // 8. Unique Booking Reference
    const bookingRef = generateBookingRef();

    // 9. Execute transactional booking creation
    const newBooking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          bookingRef,
          userId: user.id,
          patientName: patientDetails.name,
          patientAge: Number(patientDetails.age),
          patientGender: patientDetails.gender || 'Not Specified',
          patientPhone: patientDetails.phone,
          patientEmail: patientDetails.email || null,
          collectionType: isHome ? 'HOME_COLLECTION' : 'CENTER_VISIT',
          status: 'CONFIRMED',
          scheduledDate: targetDate,
          slotTime,
          serviceLocationId,
          addressString,
          subtotal: calculatedSubtotal,
          discount: calculatedDiscount,
          collectionFee,
          finalAmount,
          paymentStatus,
          paymentMethod: isOnline ? 'ONLINE' : paymentMethod === 'CASH_ON_COLLECTION' ? 'CASH_ON_COLLECTION' : 'PAY_AT_LAB',
          paymentId,
          notes: patientDetails.notes || null,
          items: {
            create: verifiedBookingItems,
          },
        },
        include: {
          items: true,
          serviceLocation: true,
        },
      });

      // Record coupon redemption if applicable
      if (couponRecord) {
        await tx.couponRedemption.create({
          data: {
            couponId: couponRecord.id,
            bookingId: created.id,
            userId: user.id,
            discountApplied: calculatedDiscount,
          },
        });

        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { currentUses: { increment: 1 } },
        });
      }

      // Save address to patient's address book if requested
      if (isHome && address && user) {
        const existingAddress = await tx.patientAddress.findFirst({
          where: {
            userId: user.id,
            pincode: address.pincode,
            houseNumber: address.houseNumber,
          },
        });
        if (!existingAddress) {
          await tx.patientAddress.create({
            data: {
              userId: user.id,
              label: address.label || 'Home',
              houseNumber: address.houseNumber,
              street: address.street || '',
              area: address.area || '',
              city: address.city || '',
              pincode: address.pincode,
              landmark: address.landmark || null,
              isDefault: true,
            },
          });
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          action: 'BOOKING_CREATED',
          entityType: 'Booking',
          entityId: created.id,
          detailsJson: JSON.stringify({
            bookingRef: created.bookingRef,
            amount: finalAmount,
            patient: patientDetails.name,
            collectionType,
          }),
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create booking' }, { status: 500 });
  }
}
