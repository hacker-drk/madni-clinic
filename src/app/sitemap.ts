import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://madniclinic.com';
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book-appointment`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    const db = getDb();

    // Doctor profile pages
    const doctors = db.prepare('SELECT slug, updated_at FROM doctors WHERE active = 1').all() as {
      slug: string;
      updated_at: string;
    }[];

    doctors.forEach((doc) => {
      routes.push({
        url: `${baseUrl}/doctors/${doc.slug}`,
        lastModified: doc.updated_at ? new Date(doc.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });

    // Service detail pages
    const services = db.prepare('SELECT slug, updated_at FROM services WHERE active = 1').all() as {
      slug: string;
      updated_at: string;
    }[];

    services.forEach((s) => {
      routes.push({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (e) {
    console.error('Error generating sitemap routes from db', e);
  }

  return routes;
}
