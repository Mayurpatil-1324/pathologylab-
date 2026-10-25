import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const dateStr = searchParams.get('date');

    if (!locationId) {
      return NextResponse.json({ success: false, message: 'Location ID is required' }, { status: 400 });
    }

    const slots = await prisma.collectionSlot.findMany({
      where: {
        serviceLocationId: locationId,
        isActive: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // If date is provided, check existing bookings to compute available capacity
    let slotsWithAvailability = slots.map((s) => ({
      ...s,
      availableCapacity: s.capacity,
      isAvailable: true,
    }));

    if (dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

      const existingBookings = await prisma.booking.findMany({
        where: {
          serviceLocationId: locationId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            notIn: ['CANCELLED'],
          },
        },
        select: {
          slotTime: true,
        },
      });

      const slotUsage: Record<string, number> = {};
      for (const b of existingBookings) {
        slotUsage[b.slotTime] = (slotUsage[b.slotTime] || 0) + 1;
      }

      slotsWithAvailability = slots.map((s) => {
        const slotKey = `${s.startTime} - ${s.endTime}`;
        const used = slotUsage[slotKey] || 0;
        const remaining = Math.max(0, s.capacity - used);
        return {
          ...s,
          availableCapacity: remaining,
          isAvailable: remaining > 0,
        };
      });
    }

    return NextResponse.json({ success: true, slots: slotsWithAvailability });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch slots' }, { status: 500 });
  }
}
