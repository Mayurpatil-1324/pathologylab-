import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.serviceLocation.findMany({
      where: { isActive: true },
      orderBy: { city: 'asc' },
    });
    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch locations' }, { status: 500 });
  }
}
