import prisma from '@/lib/prisma';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { HomeView } from '@/components/home/home-view';

export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  const [categories, popularTests, featuredPackages, faqs, testimonials] = await Promise.all([
    prisma.testCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            tests: { where: { isActive: true } },
          },
        },
      },
    }),
    prisma.diagnosticTest.findMany({
      where: { isActive: true, isPopular: true },
      take: 8,
      include: {
        category: true,
        parameters: true,
      },
      orderBy: { sellingPrice: 'asc' },
    }),
    prisma.healthPackage.findMany({
      where: { isActive: true },
      take: 6,
      include: {
        category: true,
        tests: {
          include: {
            test: {
              include: {
                parameters: true,
              },
            },
          },
        },
      },
      orderBy: { isFeatured: 'desc' },
    }),
    prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainHeader />
      <main className="flex-1">
        <HomeView
          categories={categories}
          popularTests={popularTests}
          featuredPackages={featuredPackages}
          faqs={faqs}
          testimonials={testimonials}
        />
      </main>
      <MainFooter />
    </div>
  );
}
