import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole, canManageBookings } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const collectionType = searchParams.get('collectionType')?.trim();
    const paymentStatus = searchParams.get('paymentStatus')?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (search) {
      where.OR = [
        { bookingRef: { contains: search } },
        { patientName: { contains: search } },
        { patientPhone: { contains: search } },
        { patientEmail: { contains: search } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (collectionType && collectionType !== 'ALL') {
      where.collectionType = collectionType;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          serviceLocation: true,
          reports: true,
          phlebotomist: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageBookings(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, phlebotomistId, paymentStatus, notes, cancellationReason } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const dataToUpdate: Prisma.BookingUpdateInput = {};
    if (status) dataToUpdate.status = status;
    if (phlebotomistId !== undefined) {
      dataToUpdate.phlebotomist = phlebotomistId ? { connect: { id: phlebotomistId } } : { disconnect: true };
    }
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (cancellationReason !== undefined) dataToUpdate.cancellationReason = cancellationReason;

    const updated = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
      include: {
        items: true,
        serviceLocation: true,
        phlebotomist: { select: { id: true, name: true, phone: true } },
      },
    });

    // Record sensitive status change in Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'BOOKING_UPDATED',
        entityType: 'Booking',
        entityId: id,
        detailsJson: JSON.stringify({
          bookingRef: existing.bookingRef,
          prevStatus: existing.status,
          newStatus: status || existing.status,
          updatedFields: Object.keys(dataToUpdate),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updated,
    });
  } catch (error) {
    console.error('Error updating admin booking:', error);
    return NextResponse.json({ success: false, message: 'Failed to update booking' }, { status: 500 });
  }
}
