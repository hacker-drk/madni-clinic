import React from 'react';
import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { Doctor, ClinicSettings } from '@/lib/types';
import { BookingWizard } from '@/components/BookingWizard';

export const metadata: Metadata = {
  title: 'Book an Appointment | Madni Clinic D.I. Khan',
  description:
    'Schedule your medical consultation with Lady Dr. Sana Bashir or Dr. Sharjeel at Madni Clinic, D.I. Khan. Real-time availability and double-booking protection.',
};

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ doctorId?: string }>;
}

export default async function BookAppointmentPage({ searchParams }: Props) {
  const { doctorId } = await searchParams;
  const db = getDb();

  const doctors = db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY id ASC').all() as Doctor[];
  const settings = (db.prepare('SELECT whatsapp, phone FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;

  const initialDocId = doctorId ? parseInt(doctorId, 10) : undefined;

  return (
    <div style={{ padding: '3.5rem 0 5rem', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <span className="section-badge">Online Appointments</span>
          <h1 className="section-title" style={{ fontSize: '2.3rem' }}>
            Book Your Consultation
          </h1>
          <p className="section-subtitle">
            Select your doctor, pick an open date and time slot, and reserve your clinic visit instantly.
          </p>
        </div>

        <BookingWizard
          doctors={doctors}
          initialDoctorId={initialDocId}
          clinicWhatsapp={settings.whatsapp}
          clinicPhone={settings.phone}
        />
      </div>
    </div>
  );
}
