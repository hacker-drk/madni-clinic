import React from 'react';
import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { Doctor } from '@/lib/types';
import { DoctorCard } from '@/components/DoctorCard';

export const metadata: Metadata = {
  title: 'Our Doctors | Lady Dr. Sana Bashir & Dr. Sharjeel',
  description:
    'Meet the verified medical specialists at Madni Clinic, D.I. Khan: Lady Dr. Sana Bashir (Gynaecologist) and Dr. Sharjeel (Skin Specialist – Medical Specialist).',
};

export const revalidate = 0;

export default function DoctorsPage() {
  const db = getDb();
  const doctors = db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY id ASC').all() as Doctor[];

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <span className="section-badge">Medical Team</span>
          <h1 className="section-title" style={{ fontSize: '2.4rem' }}>
            Our Medical Specialists
          </h1>
          <p className="section-subtitle">
            Madni Clinic is staffed by verified clinical professionals dedicated to attentive, patient-first care in Dera Ismail Khan.
          </p>
        </div>

        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
}
