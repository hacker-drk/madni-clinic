import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ClinicSettings } from '@/lib/types';
import { ContactForm } from '@/components/ContactForm';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us & Location | Madni Clinic D.I. Khan',
  description:
    'Contact Madni Clinic in Dera Ismail Khan. Address: Madni Street, Gillani Town, Near Wensum College. WhatsApp: 0349-5272815.',
};

export const revalidate = 0;

export default function ContactPage() {
  const db = getDb();
  const settings = (db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;

  const phone = settings.phone || '0349-5272815';
  const whatsapp = settings.whatsapp || '0349-5272815';
  const address = settings.address || 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan';
  const hours = settings.opening_hours || '24/7 Hours (Open 24 Hours / 7 Days a Week)';
  const mapUrl = settings.map_url || 'https://maps.google.com/maps?q=Madni+Street+Gillani+Town+Near+Wensum+College+D.I.+Khan&t=&z=15&ie=UTF8&iwloc=&output=embed';

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-badge">Get in Touch</span>
          <h1 className="section-title" style={{ fontSize: '2.4rem' }}>
            Contact Madni Clinic
          </h1>
          <p className="section-subtitle">
            Reach out with any clinical inquiries or visit our outpatient clinic in Dera Ismail Khan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
          {/* Clinic Contact Details */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                Clinic Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Location:</strong>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {address}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: 'var(--radius-md)' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Official WhatsApp:</strong>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      {whatsapp}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: 'var(--radius-md)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Call Clinic:</strong>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      {phone}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: 'var(--radius-md)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Opening Hours:</strong>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {hours}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${internationalWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ flex: 1 }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>
                <Link href="/book-appointment" className="btn btn-primary" style={{ flex: 1 }}>
                  <Calendar size={16} />
                  <span>Book Slot</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Send Us a Message</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Have questions regarding doctor consultations or clinic services? Fill out the form below.
            </p>
            <ContactForm />
          </div>
        </div>

        {/* Google Maps Embed */}
        <section aria-label="Google Maps Location">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', textAlign: 'center' }}>
            Find Us on Google Maps
          </h2>
          <div
            style={{
              height: '420px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              backgroundColor: '#E2E8F0',
            }}
          >
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Madni Clinic Google Maps Embed"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
