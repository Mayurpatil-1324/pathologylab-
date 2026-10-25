import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://healthpointdiagnostics.in';

  let testUrls: MetadataRoute.Sitemap = [];
  let packageUrls: MetadataRoute.Sitemap = [];

  try {
    const [tests, packages] = await Promise.all([
      prisma.diagnosticTest.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.healthPackage.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ]);

    testUrls = tests.map((t) => ({
      url: `${baseUrl}/tests/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    packageUrls = packages.map((p) => ({
      url: `${baseUrl}/packages/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // fallback
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/tests`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/policies/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/refund`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [...staticUrls, ...testUrls, ...packageUrls];
}
