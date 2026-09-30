import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Service } from '@/lib/types';
import { ServiceCard } from '@/components/ServiceCard';
import { Heart, Sparkles, Calendar, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Clinical Services | Gynaecology & Skin/Medical Care',
  description:
    'Comprehensive healthcare services at Madni Clinic D.I. Khan: Gynaecology, Antenatal care, Skin consultations, and Specialist Medical Assessments.',
};

export const revalidate = 0;

export default function ServicesPage() {
  const db = getDb();

  const services = db.prepare(`
    SELECT s.*, d.name as doctor_name
    FROM services s
    JOIN doctors d ON s.doctor_id = d.id
    WHERE s.active = 1 AND d.active = 1
    ORDER BY s.id ASC
  `).all() as Service[];

  const settings = db.prepare('SELECT whatsapp FROM clinic_settings WHERE id = 1').get() as { whatsapp: string } | undefined;
  const whatsapp = settings?.whatsapp || '0349-5272815';
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');
  const intWa = cleanWa.startsWith('0') ? '92' + cleanWa.slice(1) : cleanWa;

  const gynServices = services.filter((s) => s.category === 'Gynaecology');
  const skinServices = services.filter((s) => s.category !== 'Gynaecology');

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">Medical Services</span>
          <h1 className="section-title" style={{ fontSize: '2.4rem' }}>
            Clinical Consultations &amp; Healthcare
          </h1>
          <p className="section-subtitle">
            Madni Clinic provides dedicated clinical services in Women&apos;s Healthcare and Skin &amp; Medical Consultations in Dera Ismail Khan.
          </p>
        </div>

        {/* Category 1: Gynaecology */}
        <section style={{ marginBottom: '4rem' }} aria-labelledby="gyn-services-heading">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '0.85rem',
              borderBottom: '2px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Heart size={22} />
              </div>
              <div>
                <h2 id="gyn-services-heading" style={{ fontSize: '1.5rem' }}>
                  Gynaecology Services
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Led by Lady Dr. Sana Bashir (MBBS, DOWH, Royal College of Physician Ireland)
                </p>
              </div>
            </div>

            <Link href="/book-appointment?doctorId=1" className="btn btn-outline btn-sm">
              <Calendar size={15} />
              <span>Book Gynaecology Slot</span>
            </Link>
          </div>

          <div className="services-grid">
            {gynServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Category 2: Skin & Medical Care */}
        <section aria-labelledby="skin-services-heading">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '0.85rem',
              borderBottom: '2px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <h2 id="skin-services-heading" style={{ fontSize: '1.5rem' }}>
                  Skin &amp; Medical Care Services
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Led by Dr. Sharjeel (Skin Specialist – Medical Specialist)
                </p>
              </div>
            </div>

            <Link href="/book-appointment?doctorId=2" className="btn btn-outline btn-sm">
              <Calendar size={15} />
              <span>Book Specialist Slot</span>
            </Link>
          </div>

          <div className="services-grid">
            {skinServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Help banner */}
        <div
          style={{
            marginTop: '4rem',
            padding: '2.5rem',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Need guidance on which service or specialist to consult?
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Contact our clinic desk via WhatsApp or phone. We will help you select the most suitable consultation time.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/${intWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Inquire via WhatsApp</span>
            </a>
            <Link href="/book-appointment" className="btn btn-primary">
              <Calendar size={18} />
              <span>Book Online Appointment</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
