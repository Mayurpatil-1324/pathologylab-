import React from 'react';
import prisma from '@/lib/prisma';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { PackageCard } from '@/components/ui/package-card';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  let packages: any[] = [];
  try {
    packages = await prisma.healthPackage.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { sellingPrice: 'asc' }],
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
    });
  } catch (error) {
    console.warn('Error loading packages:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Preventive Health Screenings
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight">
            Comprehensive Health Checkup Packages
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1 max-w-3xl">
            Save up to 60% with all-inclusive diagnostic packages designed by expert clinical pathologists. Covers vital organs, diabetes, heart health, vitamin deficiencies, and full-body wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} packageData={pkg as any} />
          ))}
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
