'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { MessageCircle, Calendar, Menu, X, Phone } from 'lucide-react';

interface HeaderProps {
  phone?: string;
  whatsapp?: string;
}

export function Header({ phone = '0349-5272815', whatsapp = '0349-5272815' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If in /admin route, don't show public header
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="header-wrapper" role="banner">
        <div className="container header-container">
          <div className="header-brand">
            <Logo size="md" />
          </div>

          <nav className="header-nav" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`header-nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <a
              href={`https://wa.me/${internationalWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
              aria-label="Chat with Madni Clinic on WhatsApp"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </a>

            <Link href="/book-appointment" className="btn btn-primary btn-sm">
              <Calendar size={16} />
              <span>Book Appointment</span>
            </Link>

            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-nav-header">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{ padding: '0.4rem', color: 'var(--color-text-main)' }}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <Link
            href="/book-appointment"
            className="btn btn-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calendar size={18} />
            <span>Book Appointment</span>
          </Link>
          <a
            href={`https://wa.me/${internationalWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="btn btn-outline"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Phone size={18} />
            <span>Call Clinic: {phone}</span>
          </a>
        </div>
      </div>
    </>
  );
}
