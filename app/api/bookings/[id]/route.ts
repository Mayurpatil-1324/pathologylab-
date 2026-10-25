import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        items: true,
        serviceLocation: true,
        reports: true,
        phlebotomist: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Patient Ownership & Staff Authorization Check
    const isOwner = booking.userId === user.id;
    const isStaff = isStaffRole(user.role);

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permission to view this booking' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch booking details' }, { status: 500 });
  }
}
