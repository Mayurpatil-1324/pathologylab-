import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, canManageTests } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const packages = await prisma.healthPackage.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        tests: {
          include: {
            test: {
              select: {
                id: true,
                name: true,
                testCode: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching admin packages:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageTests(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      shortDescription,
      overview,
      mrpPrice,
      sellingPrice,
      discountPercent,
      fastingRequired,
      fastingHours,
      reportTurnaroundHours,
      isFeatured,
      isPopular,
      testIds,
    } = body;

    if (!name || !sellingPrice) {
      return NextResponse.json({ success: false, message: 'Name and selling price are required' }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await prisma.healthPackage.create({
      data: {
        name,
        slug: generatedSlug,
        shortDescription: shortDescription || name,
        overview: overview || name,
        mrpPrice: Number(mrpPrice) || Number(sellingPrice),
        sellingPrice: Number(sellingPrice),
        discountPercent: Number(discountPercent) || 0,
        fastingRequired: Boolean(fastingRequired),
        fastingHours: Number(fastingHours) || 0,
        reportTurnaroundHours: Number(reportTurnaroundHours) || 24,
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
        tests: testIds && Array.isArray(testIds) ? {
          create: testIds.map((tid: string) => ({
            testId: tid,
          })),
        } : undefined,
      },
      include: {
        tests: { include: { test: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Package created successfully', package: created });
  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create package' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageTests(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, testIds, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Package ID required' }, { status: 400 });
    }

    // Update package fields
    await prisma.healthPackage.update({
      where: { id },
      data: {
        ...fields,
        mrpPrice: fields.mrpPrice !== undefined ? Number(fields.mrpPrice) : undefined,
        sellingPrice: fields.sellingPrice !== undefined ? Number(fields.sellingPrice) : undefined,
        discountPercent: fields.discountPercent !== undefined ? Number(fields.discountPercent) : undefined,
        fastingHours: fields.fastingHours !== undefined ? Number(fields.fastingHours) : undefined,
      },
    });

    // If testIds are provided, update relationships
    if (testIds && Array.isArray(testIds)) {
      await prisma.packageTest.deleteMany({ where: { packageId: id } });
      for (const tid of testIds) {
        await prisma.packageTest.create({
          data: {
            packageId: id,
            testId: tid,
          },
        });
      }
    }

    const updated = await prisma.healthPackage.findUnique({
      where: { id },
      include: {
        tests: { include: { test: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Package updated successfully', package: updated });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json({ success: false, message: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageTests(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const pkg = await prisma.healthPackage.findUnique({ where: { id } });
    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    const updated = await prisma.healthPackage.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });

    return NextResponse.json({
      success: true,
      message: updated.isActive ? 'Package enabled' : 'Package archived',
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error('Error archiving package:', error);
    return NextResponse.json({ success: false, message: 'Failed to toggle package' }, { status: 500 });
  }
}
