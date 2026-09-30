'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

interface MobileActionBarProps {
  phone?: string;
  whatsapp?: string;
}

export function MobileActionBar({ phone = '0349-5272815', whatsapp = '0349-5272815' }: MobileActionBarProps) {
  const pathname = usePathname();

  // Hide on admin routes or when already on booking page
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <nav className="mobile-action-bar" aria-label="Quick Actions">
      <a
        href={`tel:${cleanPhone}`}
        className="mobile-bar-btn call-btn"
        aria-label="Call Madni Clinic"
      >
        <Phone size={19} />
        <span>CALL</span>
      </a>

      <a
        href={`https://wa.me/${internationalWa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-bar-btn whatsapp-btn"
        aria-label="WhatsApp Madni Clinic"
      >
        <MessageCircle size={19} />
        <span>WHATSAPP</span>
      </a>

      <Link
        href="/book-appointment"
        className="mobile-bar-btn book-cta"
        aria-label="Book Appointment at Madni Clinic"
      >
        <Calendar size={18} />
        <span>BOOK NOW</span>
      </Link>
    </nav>
  );
}
