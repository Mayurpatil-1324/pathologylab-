import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, canManageTests } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const categoryId = searchParams.get('categoryId')?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { testCode: { contains: search } },
      ];
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    const tests = await prisma.diagnosticTest.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        parameters: { orderBy: { displayOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching admin tests:', error);
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
      testCode,
      name,
      slug,
      categoryId,
      shortDescription,
      overview,
      clinicalPurpose,
      sampleType,
      fastingRequired,
      fastingHours,
      preparation,
      reportTurnaroundHours,
      mrpPrice,
      sellingPrice,
      discountPercent,
      isPopular,
      isHomeCollectionAvailable,
      isCenterVisitAvailable,
      parameters,
    } = body;

    if (!testCode || !name || !categoryId || !sellingPrice) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await prisma.diagnosticTest.create({
      data: {
        testCode,
        name,
        slug: generatedSlug,
        categoryId,
        shortDescription: shortDescription || name,
        overview: overview || name,
        clinicalPurpose: clinicalPurpose || name,
        sampleType: sampleType || 'Blood (Serum)',
        fastingRequired: Boolean(fastingRequired),
        fastingHours: Number(fastingHours) || 0,
        preparation: preparation || 'Standard preparation',
        reportTurnaroundHours: Number(reportTurnaroundHours) || 24,
        mrpPrice: Number(mrpPrice) || Number(sellingPrice),
        sellingPrice: Number(sellingPrice),
        discountPercent: Number(discountPercent) || 0,
        isPopular: Boolean(isPopular),
        isHomeCollectionAvailable: isHomeCollectionAvailable !== false,
        isCenterVisitAvailable: isCenterVisitAvailable !== false,
        parameters: parameters && Array.isArray(parameters) ? {
          create: parameters.map((p: any, idx: number) => ({
            name: p.name,
            referenceRange: p.referenceRange || null,
            unit: p.unit || null,
            description: p.description || null,
            displayOrder: idx + 1,
          })),
        } : undefined,
      },
      include: {
        category: true,
        parameters: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'TEST_CREATED',
        entityType: 'DiagnosticTest',
        entityId: created.id,
        detailsJson: JSON.stringify({ name: created.name, testCode: created.testCode }),
      },
    });

    return NextResponse.json({ success: true, message: 'Test created successfully', test: created });
  } catch (error: any) {
    console.error('Error creating test:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to create test' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageTests(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, parameters, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Test ID is required' }, { status: 400 });
    }

    // Update test details
    const updated = await prisma.diagnosticTest.update({
      where: { id },
      data: {
        ...fields,
        fastingHours: fields.fastingHours !== undefined ? Number(fields.fastingHours) : undefined,
        reportTurnaroundHours: fields.reportTurnaroundHours !== undefined ? Number(fields.reportTurnaroundHours) : undefined,
        mrpPrice: fields.mrpPrice !== undefined ? Number(fields.mrpPrice) : undefined,
        sellingPrice: fields.sellingPrice !== undefined ? Number(fields.sellingPrice) : undefined,
        discountPercent: fields.discountPercent !== undefined ? Number(fields.discountPercent) : undefined,
      },
      include: {
        category: true,
        parameters: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'TEST_UPDATED',
        entityType: 'DiagnosticTest',
        entityId: id,
        detailsJson: JSON.stringify({ name: updated.name, fieldsUpdated: Object.keys(fields) }),
      },
    });

    return NextResponse.json({ success: true, message: 'Test updated successfully', test: updated });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ success: false, message: 'Failed to update test' }, { status: 500 });
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

    const test = await prisma.diagnosticTest.findUnique({ where: { id } });
    if (!test) {
      return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
    }

    // Toggle active state / archive
    const updated = await prisma.diagnosticTest.update({
      where: { id },
      data: { isActive: !test.isActive },
    });

    return NextResponse.json({
      success: true,
      message: updated.isActive ? 'Test unarchived' : 'Test archived successfully',
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error('Error archiving test:', error);
    return NextResponse.json({ success: false, message: 'Failed to archive test' }, { status: 500 });
  }
}
