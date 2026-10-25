import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const test = await prisma.diagnosticTest.findUnique({
      where: { slug },
      include: {
        category: true,
        parameters: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!test || !test.isActive) {
      return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
    }

    // Get related tests from same category
    const relatedTests = await prisma.diagnosticTest.findMany({
      where: {
        categoryId: test.categoryId,
        id: { not: test.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      test,
      relatedTests,
    });
  } catch (error) {
    console.error('Error fetching test detail:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch test' }, { status: 500 });
  }
}
