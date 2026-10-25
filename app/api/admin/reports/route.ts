import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, canManageReports } from '@/lib/auth';
import { generateReportNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageReports(user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { reportNumber: { contains: search } },
        { booking: { bookingRef: { contains: search } } },
        { booking: { patientName: { contains: search } } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.medicalReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            bookingRef: true,
            patientName: true,
            patientPhone: true,
            scheduledDate: true,
            status: true,
          },
        },
        releasedBy: {
          select: { name: true, role: true },
        },
        revisions: true,
      },
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageReports(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, remarks, status = 'RELEASED' } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const reportNumber = generateReportNumber();
    const fileName = `HealthPoint_Report_${booking.bookingRef}.pdf`;

    const report = await prisma.medicalReport.create({
      data: {
        bookingId,
        reportNumber,
        fileName,
        fileUrl: `/api/reports/download/${reportNumber}`,
        fileSize: 450000 + Math.floor(Math.random() * 50000),
        status,
        remarks: remarks || 'Verified by consulting pathologist. All parameters calibrated against automated reference controls.',
        releasedAt: status === 'RELEASED' ? new Date() : null,
        releasedById: user.id,
      },
      include: {
        booking: true,
      },
    });

    // Update booking status to REPORT_READY or COMPLETED if released
    if (status === 'RELEASED') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'REPORT_RELEASED',
        entityType: 'MedicalReport',
        entityId: report.id,
        detailsJson: JSON.stringify({
          reportNumber: report.reportNumber,
          bookingRef: booking.bookingRef,
          patient: booking.patientName,
          status,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Medical report released successfully',
      report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ success: false, message: 'Failed to create report' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageReports(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, remarks, changeReason } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Report ID required' }, { status: 400 });
    }

    const existing = await prisma.medicalReport.findUnique({
      where: { id },
      include: { revisions: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    // If changeReason is provided, log a report revision
    if (changeReason) {
      await prisma.reportRevision.create({
        data: {
          reportId: id,
          revisionNumber: existing.revisions.length + 1,
          fileUrl: existing.fileUrl,
          changeReason,
          updatedById: user.id,
        },
      });
    }

    const updated = await prisma.medicalReport.update({
      where: { id },
      data: {
        status: status || existing.status,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        releasedAt: status === 'RELEASED' && !existing.releasedAt ? new Date() : existing.releasedAt,
        releasedById: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'REPORT_UPDATED',
        entityType: 'MedicalReport',
        entityId: id,
        detailsJson: JSON.stringify({
          reportNumber: existing.reportNumber,
          status: status || existing.status,
          revisionLogged: Boolean(changeReason),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      report: updated,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ success: false, message: 'Failed to update report' }, { status: 500 });
  }
}
