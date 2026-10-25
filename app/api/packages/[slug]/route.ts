import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const pkg = await prisma.healthPackage.findUnique({
      where: { slug },
      include: {
        category: true,
        tests: {
          include: {
            test: {
              include: {
                category: true,
                parameters: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ success: false, message: 'Health package not found' }, { status: 404 });
    }

    const otherPackages = await prisma.healthPackage.findMany({
      where: {
        id: { not: pkg.id },
        isActive: true,
      },
      take: 3,
      include: {
        tests: {
          include: {
            test: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      package: pkg,
      otherPackages,
    });
  } catch (error) {
    console.error('Error fetching package detail:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch package' }, { status: 500 });
  }
}
