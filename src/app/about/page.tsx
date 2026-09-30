import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Doctor, ClinicSettings } from '@/lib/types';
import { DoctorCard } from '@/components/DoctorCard';
import {
  ShieldCheck,
  Heart,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Madni Clinic D.I. Khan',
  description:
    'Learn about Madni Clinic in D.I. Khan, providing personalized patient care, specialized women healthcare, and dermatology services in a clean clinical environment.',
};

export const revalidate = 0;

export default function AboutPage() {
  const db = getDb();
  const doctors = db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY id ASC').all() as Doctor[];
  const settings = (db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;

  const address = settings.address || 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan';
  const whatsapp = settings.whatsapp || '0349-5272815';
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');
  const intWa = cleanWa.startsWith('0') ? '92' + cleanWa.slice(1) : cleanWa;

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">Clinic Background</span>
          <h1 className="section-title" style={{ fontSize: '2.4rem' }}>
            About Madni Clinic
          </h1>
          <p className="section-subtitle">
            Providing professional healthcare services with a focus on patient care, convenience and personalized medical attention.
          </p>
        </div>

        {/* Section 1: Introduction */}
        <div style={{ maxWidth: '900px', margin: '0 auto 4rem auto' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
              Dedicated to Compassionate Community Care
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Madni Clinic is a private outpatient healthcare center located in Gillani Town, Dera Ismail Khan. We strive to offer our patients accessible, respectful, and high-quality medical consultations in an organized and supportive clinical setting.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              Our clinical practice focuses on two key healthcare disciplines: comprehensive gynaecological care and specialized medical consultations for skin and general systemic wellness.
            </p>
          </div>
        </div>

        {/* Section 2: Core Values */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-badge">Principles</span>
            <h2 style={{ fontSize: '1.8rem' }}>Patient-Focused Healthcare Principles</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <Heart size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Compassion &amp; Dignity</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Every patient is treated with utmost respect, confidentiality, and attentive medical listening.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>
                <ShieldCheck size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Professional Standards</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Consultations are provided by verified physicians with recognized credentials and specialist training.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <Clock size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Scheduled Convenience</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                An organized appointment system guarantees that dedicated time is allocated for your consultation without unnecessary crowding.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Our Doctors */}
        <div style={{ marginBottom: '4.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-badge">Our Specialists</span>
            <h2 style={{ fontSize: '1.8rem' }}>Our Doctors</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Meet the clinicians responsible for your care at Madni Clinic.
            </p>
          </div>

          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>

        {/* Section 4: Location & Clinic Environment */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <div style={{ color: 'var(--color-primary)', margin: '0 auto 1rem auto', display: 'inline-block' }}>
            <MapPin size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Clinic Location &amp; Environment</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {address}
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Our clinic facility is designed to provide clean, comfortable, and private consultation rooms for both male and female patients.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book-appointment" className="btn btn-primary">
              <Calendar size={18} />
              <span>Book Appointment</span>
            </Link>
            <a
              href={`https://wa.me/${intWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Contact Desk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
