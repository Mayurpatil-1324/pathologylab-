import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, canManageStaff, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageStaff(user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        role: { not: 'PATIENT' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, staff: staffMembers });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageStaff(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'A user with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        role,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'STAFF_CREATED',
        entityType: 'User',
        entityId: created.id,
        detailsJson: JSON.stringify({ name: created.name, role: created.role }),
      },
    });

    return NextResponse.json({ success: true, message: 'Staff member added successfully', staff: created });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create staff' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageStaff(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, role, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role !== undefined ? role : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Staff member updated', staff: updated });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ success: false, message: 'Failed to update staff' }, { status: 500 });
  }
}
