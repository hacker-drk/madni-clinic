import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Doctor, Service, Schedule, ClinicSettings } from '@/lib/types';
import { formatTime12 } from '@/lib/utils';
import {
  Calendar,
  Award,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Info,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const doctor = db.prepare('SELECT * FROM doctors WHERE slug = ?').get(slug) as Doctor | undefined;

  if (!doctor) {
    return { title: 'Doctor Not Found | Madni Clinic' };
  }

  return {
    title: `${doctor.name} - ${doctor.specialization} | Madni Clinic D.I. Khan`,
    description: `Book consultation with ${doctor.name} (${doctor.specialization}) at Madni Clinic, D.I. Khan. Address: Madni Street, Gillani Town.`,
  };
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const doctor = db.prepare('SELECT * FROM doctors WHERE slug = ? AND active = 1').get(slug) as Doctor | undefined;

  if (!doctor) {
    notFound();
  }

  // Retrieve services offered by this doctor
  const services = db.prepare('SELECT * FROM services WHERE doctor_id = ? AND active = 1 ORDER BY id ASC').all(doctor.id) as Service[];

  // Retrieve schedules
  const schedules = db.prepare('SELECT * FROM schedules WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week ASC').all(doctor.id) as Schedule[];

  // Clinic settings
  const settings = (db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;

  const clinicPhone = doctor.phone || settings.phone || '0349-5272815';
  const whatsapp = doctor.whatsapp || settings.whatsapp || '0349-5272815';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/doctors" style={{ color: 'var(--color-primary)' }}>Doctors</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>{doctor.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)', gap: '3rem', alignItems: 'start' }}>
          {/* Main Info */}
          <div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E0F2FE 0%, #CCFBF1 100%)',
                  border: '3px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={doctor.photo || '/images/dr-sana-bashir.svg'}
                  alt={`${doctor.name} - ${doctor.specialization}`}
                  width={110}
                  height={110}
                  style={{ objectFit: 'contain' }}
                />
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#065F46',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: '0.65rem',
                  }}
                >
                  {doctor.specialization}
                </span>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{doctor.name}</h1>

                {doctor.qualification && doctor.qualification !== 'Information will be updated soon.' && (
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                    {doctor.qualification}
                  </div>
                )}

                {doctor.professional_affiliation && doctor.professional_affiliation !== 'Information will be updated soon.' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Award size={16} />
                    <span>{doctor.professional_affiliation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Biography */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.85rem' }}>About {doctor.name}</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                {doctor.biography}
              </p>
            </div>

            {/* Services Offered */}
            {services.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Clinical Consultation Services</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {services.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{s.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                        {s.description}
                      </p>
                      <Link
                        href={`/services/${s.slug}`}
                        style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <span>Learn more</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Note & Unverified fields note */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Consultation Note:</strong> Clinic consultations follow a scheduled appointment slot. For consultation fees and special cases, please confirm with the clinic desk or book your slot online.
              </div>
            </div>
          </div>

          {/* Sidebar Action & Schedule Card */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                Consultation &amp; Booking
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <Link
                  href={`/book-appointment?doctorId=${doctor.id}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  <Calendar size={18} />
                  <span>Book Appointment</span>
                </Link>

                <a
                  href={`https://wa.me/${internationalWa}?text=${encodeURIComponent(`Hello, I would like to book a consultation with ${doctor.name} at Madni Clinic.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp</span>
                </a>

                {doctor.phone && (
                  <a
                    href={`tel:${doctor.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    <Phone size={18} />
                    <span>Call Clinic ({doctor.phone})</span>
                  </a>
                )}
              </div>

              {/* Weekly Schedule */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Weekly Clinic Hours</span>
                </h4>

                {schedules.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Information will be updated soon.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                    {schedules.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{s.day_name}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {formatTime12(s.start_time)} – {formatTime12(s.end_time)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Badge */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>Madni Street, Gillani Town, Near Wensum College, D.I. Khan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
