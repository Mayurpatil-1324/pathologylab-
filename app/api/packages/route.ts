import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim();
    const featuredOnly = searchParams.get('featured') === 'true';

    const where: Prisma.HealthPackageWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    const packages = await prisma.healthPackage.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { sellingPrice: 'asc' }],
      include: {
        category: true,
        tests: {
          include: {
            test: {
              include: {
                category: true,
                parameters: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, count: packages.length, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch packages' }, { status: 500 });
  }
}
