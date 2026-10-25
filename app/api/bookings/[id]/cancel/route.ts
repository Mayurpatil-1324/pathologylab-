import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Requested by patient';

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingRef: id }] },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const isOwner = booking.userId === user.id;
    const isStaff = isStaffRole(user.role);

    if (!isOwner && !isStaff) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ success: false, message: 'Completed bookings cannot be cancelled' }, { status: 400 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ success: false, message: 'Booking is already cancelled' }, { status: 400 });
    }

    const updatedPaymentStatus = booking.paymentStatus === 'PAID' ? 'REFUND_PENDING' : booking.paymentStatus;

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        paymentStatus: updatedPaymentStatus,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: booking.id,
        detailsJson: JSON.stringify({
          bookingRef: booking.bookingRef,
          cancelledBy: user.name,
          reason,
          refundStatus: updatedPaymentStatus,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully. If paid online, refund will be processed within 3-5 business days.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to cancel booking' }, { status: 500 });
  }
}
