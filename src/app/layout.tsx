import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileActionBar } from '@/components/MobileActionBar';
import { getDb } from '@/lib/db';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#155E75',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Madni Clinic | Medical & Gynaecology Clinic in D.I. Khan',
    template: '%s | Madni Clinic D.I. Khan',
  },
  description:
    "Madni Clinic in D.I. Khan provides professional medical, skin and gynaecology consultations with convenient appointment booking.",
  keywords: [
    'Madni Clinic',
    'D.I. Khan Clinic',
    'Dera Ismail Khan Hospital',
    'Lady Dr. Sana Bashir',
    'Gynaecologist D.I. Khan',
    'Dr. Sharjeel',
    'Skin Specialist D.I. Khan',
    'Medical Specialist D.I. Khan',
    'Gillani Town Clinic',
    'Wensum College D.I. Khan',
    'Doctor Appointment D.I. Khan',
  ],
  authors: [{ name: 'Madni Clinic' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://madniclinic.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Madni Clinic | Medical & Gynaecology Clinic in D.I. Khan',
    description:
      "Madni Clinic in D.I. Khan provides professional medical, skin and gynaecology consultations with convenient appointment booking.",
    url: 'https://madniclinic.com',
    siteName: 'Madni Clinic',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: '/images/clinic-hero.svg',
        width: 1200,
        height: 630,
        alt: 'Madni Clinic D.I. Khan',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = {
    clinic_name: 'Madni Clinic',
    phone: '0349-5272815',
    whatsapp: '0349-5272815',
    address: 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan, Khyber Pakhtunkhwa, Pakistan',
    opening_hours: 'Monday – Saturday: 09:00 AM – 08:00 PM | Sunday: Closed',
  };

  try {
    const db = getDb();
    const dbSettings = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get() as any;
    if (dbSettings) {
      settings = { ...settings, ...dbSettings };
    }
  } catch (e) {
    // fallback to defaults during static compile
  }

  // MedicalClinic JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Madni Clinic',
    image: 'https://madniclinic.com/logo.svg',
    url: 'https://madniclinic.com',
    telephone: '+92-349-5272815',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Madni Street, Gillani Town, Near Wensum College',
      addressLocality: 'Dera Ismail Khan',
      addressRegion: 'Khyber Pakhtunkhwa',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '31.8314',
      longitude: '70.9018',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    medicalSpecialty: ['Gynecologic', 'Dermatology'],
    physician: [
      {
        '@type': 'Physician',
        name: 'Lady Dr. Sana Bashir',
        medicalSpecialty: 'Gynaecologist',
      },
      {
        '@type': 'Physician',
        name: 'Dr. Sharjeel',
        medicalSpecialty: 'Skin Specialist – Medical Specialist',
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="has-mobile-bar">
        <Header phone={settings.phone} whatsapp={settings.whatsapp} />
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer settings={settings} />
        <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} />
      </body>
    </html>
  );
}
