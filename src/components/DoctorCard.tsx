import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Doctor } from '@/lib/types';
import { Calendar, User, MessageCircle, Phone, ArrowRight, Award, Clock } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const cleanWhatsapp = (doctor.whatsapp || '0349-5272815').replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  return (
    <article className="doctor-card" aria-labelledby={`doctor-heading-${doctor.id}`}>
      <div className="doctor-card-photo-wrapper">
        <div className="doctor-avatar-circle">
          <Image
            src={doctor.photo || '/images/dr-sana-bashir.svg'}
            alt={`${doctor.name} - ${doctor.specialization}`}
            width={90}
            height={90}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      <div className="doctor-card-body">
        <div className="doctor-specialty-badge">
          <span>{doctor.specialization}</span>
        </div>

        <h3 id={`doctor-heading-${doctor.id}`} className="doctor-name">
          {doctor.name}
        </h3>

        {doctor.qualification && doctor.qualification !== 'Information will be updated soon.' && (
          <div className="doctor-qualifications">
            <strong>Qualifications:</strong> {doctor.qualification}
          </div>
        )}

        {doctor.professional_affiliation && doctor.professional_affiliation !== 'Information will be updated soon.' && (
          <div className="doctor-affiliation" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={15} style={{ color: 'var(--color-primary)' }} />
            <span>{doctor.professional_affiliation}</span>
          </div>
        )}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.35rem', marginBottom: '0.4rem' }}>
          <Clock size={13} />
          <span>Available 24/7 Hours</span>
        </div>

        <p className="doctor-bio-snippet">{doctor.biography}</p>

        <div className="doctor-card-footer">
          <Link
            href={`/book-appointment?doctorId=${doctor.id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <Calendar size={15} />
            <span>Book Appointment</span>
          </Link>

          <Link
            href={`/doctors/${doctor.slug}`}
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
          >
            <span>View Profile</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href={`https://wa.me/${internationalWa}?text=${encodeURIComponent(`Hello, I would like to inquire about consultation with ${doctor.name} at Madni Clinic.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            aria-label={`WhatsApp ${doctor.name}`}
            title="Chat on WhatsApp"
          >
            <MessageCircle size={16} />
          </a>

          {doctor.phone && (
            <a
              href={`tel:${doctor.phone.replace(/[^0-9+]/g, '')}`}
              className="btn btn-outline btn-sm"
              aria-label={`Call ${doctor.name}`}
              title={`Call ${doctor.phone}`}
            >
              <Phone size={15} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
