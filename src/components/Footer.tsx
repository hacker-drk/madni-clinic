'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings?: {
    clinic_name?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    opening_hours?: string;
  };
}

export function Footer({ settings }: FooterProps) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const phone = settings?.phone || '0349-5272815';
  const whatsapp = settings?.whatsapp || '0349-5272815';
  const address = settings?.address || 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan';
  const hours = settings?.opening_hours || '24/7 Hours (Open 24 Hours / 7 Days a Week)';

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo variant="light" size="md" />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Professional healthcare and medical consultations in Dera Ismail Khan. Dedicated to patient-centered, compassionate care.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontSize: '0.84rem' }}>
              <ShieldCheck size={18} />
              <span>Verified Medical Professionals</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="footer-col-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/doctors" className="footer-link">Our Doctors</Link></li>
              <li><Link href="/services" className="footer-link">Medical Services</Link></li>
              <li><Link href="/about" className="footer-link">About Clinic</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link href="/book-appointment" className="footer-link">Book Appointment</Link></li>
            </ul>
          </div>

          {/* Col 3: Doctors */}
          <div>
            <h3 className="footer-col-title">Our Doctors</h3>
            <ul className="footer-links">
              <li>
                <Link href="/doctors/lady-dr-sana-bashir" className="footer-link">
                  Lady Dr. Sana Bashir
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B' }}>Gynaecologist</span>
                </Link>
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <Link href="/doctors/dr-sharjeel" className="footer-link">
                  Dr. Sharjeel
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748B' }}>Skin Specialist – Medical Specialist</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h3 className="footer-col-title">Contact &amp; Timings</h3>
            <ul className="footer-links" style={{ gap: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                <MapPin size={18} style={{ color: '#38BDF8', flexShrink: 0, marginTop: '2px' }} />
                <span>{address}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                <MessageCircle size={18} style={{ color: '#25D366', flexShrink: 0 }} />
                <a
                  href={`https://wa.me/${internationalWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  WhatsApp: {whatsapp}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                <Phone size={18} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="footer-link">
                  Call: {phone}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94A3B8', fontSize: '0.875rem' }}>
                <Clock size={18} style={{ color: '#FBBF24', flexShrink: 0, marginTop: '2px' }} />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {currentYear} Madni Clinic. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <Link href="/admin/login" style={{ color: '#64748B', fontSize: '0.78rem' }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
