import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, canManageWebsite } from '@/lib/auth';

export async function GET() {
  try {
    const contents = await prisma.websiteContent.findMany();
    return NextResponse.json({ success: true, contents });
  } catch (error) {
    console.error('Error fetching CMS content:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageWebsite(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { sectionKey, title, subtitle, contentJson, isActive } = body;

    if (!sectionKey || !title) {
      return NextResponse.json({ success: false, message: 'Section key and title are required' }, { status: 400 });
    }

    const updated = await prisma.websiteContent.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle: subtitle || null,
        contentJson: typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson),
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        sectionKey,
        title,
        subtitle: subtitle || null,
        contentJson: typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: 'CONTENT_CMS_UPDATED',
        entityType: 'WebsiteContent',
        entityId: updated.id,
        detailsJson: JSON.stringify({ sectionKey: updated.sectionKey, title: updated.title }),
      },
    });

    return NextResponse.json({ success: true, message: 'Website content updated', content: updated });
  } catch (error) {
    console.error('Error updating CMS content:', error);
    return NextResponse.json({ success: false, message: 'Failed to update content' }, { status: 500 });
  }
}
