import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        serviceLocation: true,
        items: true,
      },
    });

    const headers = [
      'Booking Ref',
      'Created Date',
      'Patient Name',
      'Patient Age',
      'Patient Gender',
      'Patient Phone',
      'Collection Type',
      'Status',
      'Scheduled Date',
      'Slot Time',
      'Location',
      'Subtotal',
      'Discount',
      'Final Amount',
      'Payment Status',
      'Payment Method',
      'Tests Count',
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingRef}"`,
      `"${formatDate(b.createdAt)}"`,
      `"${b.patientName.replace(/"/g, '""')}"`,
      b.patientAge,
      `"${b.patientGender}"`,
      `"${b.patientPhone}"`,
      `"${b.collectionType}"`,
      `"${b.status}"`,
      `"${formatDate(b.scheduledDate)}"`,
      `"${b.slotTime}"`,
      `"${b.serviceLocation.name.replace(/"/g, '""')}"`,
      b.subtotal,
      b.discount,
      b.finalAmount,
      `"${b.paymentStatus}"`,
      `"${b.paymentMethod}"`,
      b.items.length,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'DATA_EXPORT_CSV',
        entityType: 'Booking',
        entityId: 'all',
        detailsJson: JSON.stringify({ recordCount: bookings.length }),
      },
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="healthpoint_bookings_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting bookings:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
