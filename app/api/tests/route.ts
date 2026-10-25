import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const sampleType = searchParams.get('sampleType')?.trim();
    const fasting = searchParams.get('fasting');
    const sort = searchParams.get('sort') || 'popular';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const popularOnly = searchParams.get('popular') === 'true';

    const where: Prisma.DiagnosticTestWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { testCode: { contains: search } },
        { shortDescription: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    if (category && category !== 'all') {
      where.category = { slug: category };
    }

    if (sampleType && sampleType !== 'all') {
      where.sampleType = { contains: sampleType };
    }

    if (fasting === 'true') {
      where.fastingRequired = true;
    } else if (fasting === 'false') {
      where.fastingRequired = false;
    }

    if (popularOnly) {
      where.isPopular = true;
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    let orderBy: Prisma.DiagnosticTestOrderByWithRelationInput = { isPopular: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (sort === 'turnaround') {
      orderBy = { reportTurnaroundHours: 'asc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const tests = await prisma.diagnosticTest.findMany({
      where,
      orderBy,
      include: {
        category: true,
        parameters: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, count: tests.length, tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch tests' }, { status: 500 });
  }
}
