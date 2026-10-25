import prisma from '@/lib/prisma';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { TestListingView } from '@/components/tests/test-listing-view';

export const dynamic = 'force-dynamic';

export default async function TestsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  let categories: any[] = [];
  let tests: any[] = [];

  try {
    const results = await Promise.all([
      prisma.testCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      prisma.diagnosticTest.findMany({
        where: {
          isActive: true,
          ...(searchParams.category && searchParams.category !== 'all'
            ? { category: { slug: searchParams.category } }
            : {}),
          ...(searchParams.q
            ? {
                OR: [
                  { name: { contains: searchParams.q } },
                  { testCode: { contains: searchParams.q } },
                  { shortDescription: { contains: searchParams.q } },
                ],
              }
            : {}),
        },
        orderBy: { isPopular: 'desc' },
        include: {
          category: true,
          parameters: { orderBy: { displayOrder: 'asc' } },
        },
      }),
    ]);
    categories = results[0] || [];
    tests = results[1] || [];
  } catch (error) {
    console.warn('Error loading tests:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1">
        <TestListingView initialTests={tests as any} categories={categories} />
      </main>
      <MainFooter />
    </div>
  );
}
