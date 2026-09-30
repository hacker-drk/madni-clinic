import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Service, Doctor, ClinicSettings } from '@/lib/types';
import {
  Calendar,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  User,
  ShieldCheck,
  Clock,
  Info,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const service = db.prepare('SELECT name, description FROM services WHERE slug = ?').get(slug) as
    | { name: string; description: string }
    | undefined;

  if (!service) {
    return { title: 'Service Not Found | Madni Clinic' };
  }

  return {
    title: `${service.name} | Madni Clinic D.I. Khan`,
    description: service.description || 'Clinical consultation service at Madni Clinic D.I. Khan.',
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const service = db.prepare(`
    SELECT s.*, d.name as doctor_name, d.specialization as doctor_specialization, d.slug as doctor_slug, d.qualification as doctor_qualification
    FROM services s
    JOIN doctors d ON s.doctor_id = d.id
    WHERE s.slug = ? AND s.active = 1
  `).get(slug) as (Service & { doctor_name: string; doctor_specialization: string; doctor_slug: string; doctor_qualification: string }) | undefined;

  if (!service) {
    notFound();
  }

  const settings = (db.prepare('SELECT whatsapp, phone FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;
  const whatsapp = settings.whatsapp || '0349-5272815';
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');
  const intWa = cleanWa.startsWith('0') ? '92' + cleanWa.slice(1) : cleanWa;

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/services" style={{ color: 'var(--color-primary)' }}>Services</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>{service.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)', gap: '3rem', alignItems: 'start' }}>
          {/* Main Info */}
          <div>
            <span className="section-badge" style={{ marginBottom: '0.75rem' }}>
              {service.category}
            </span>

            <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
              {service.name}
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              {service.description}
            </p>

            {/* What this service covers */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>What This Consultation Covers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Focused Clinical Assessment:</strong> Comprehensive examination of current symptoms and medical evaluation.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Direct Specialist Consultation:</strong> In-depth discussion with your assigned doctor regarding concerns and treatment planning.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Medical Care &amp; Guidance:</strong> Personalized recommendations, prescriptions where clinically required, and scheduled follow-up guidance.
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor in Charge Profile Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                Consulting Specialist
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{service.doctor_name}</h3>
              <div style={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {service.doctor_specialization}
              </div>
              {service.doctor_qualification && service.doctor_qualification !== 'Information will be updated soon.' && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Qualifications: {service.doctor_qualification}
                </div>
              )}
              <Link
                href={`/doctors/${service.doctor_slug}`}
                className="btn btn-outline btn-sm"
              >
                <span>View Full Doctor Profile</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Notice */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Appointment Policy:</strong> Consultation duration is structured to allow thorough medical attention. Double-booking is strictly prohibited by our system.
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                Schedule Consultation
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Reserve your slot with <strong>{service.doctor_name}</strong> for {service.name}.
              </p>

              <Link
                href={`/book-appointment?doctorId=${service.doctor_id}`}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '0.85rem' }}
              >
                <Calendar size={18} />
                <span>Book Appointment</span>
              </Link>

              <a
                href={`https://wa.me/${intWa}?text=${encodeURIComponent(`Hello, I would like to book an appointment for ${service.name} with ${service.doctor_name} at Madni Clinic.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%' }}
              >
                <MessageCircle size={18} />
                <span>Inquire on WhatsApp</span>
              </a>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                  <span>Verified Medical Care</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Live Slot Availability Check</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
