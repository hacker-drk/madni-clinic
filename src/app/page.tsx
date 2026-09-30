import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDb } from '@/lib/db';
import { Doctor, Service, Testimonial, ClinicSettings } from '@/lib/types';
import { DoctorCard } from '@/components/DoctorCard';
import { ServiceCard } from '@/components/ServiceCard';
import {
  Calendar,
  Users,
  ShieldCheck,
  Clock,
  Heart,
  Sparkles,
  Stethoscope,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Award,
} from 'lucide-react';

export const revalidate = 0; // Always dynamic so admin edits reflect immediately

export default function HomePage() {
  const db = getDb();

  // Retrieve active doctors
  const doctors = db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY id ASC').all() as Doctor[];

  // Retrieve active services with doctor name
  const services = db.prepare(`
    SELECT s.*, d.name as doctor_name
    FROM services s
    JOIN doctors d ON s.doctor_id = d.id
    WHERE s.active = 1 AND d.active = 1
    ORDER BY s.id ASC
  `).all() as Service[];

  // Retrieve published testimonials only
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC').all() as Testimonial[];

  // Retrieve clinic settings
  const settings = (db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get() || {}) as ClinicSettings;

  const phone = settings.phone || '0349-5272815';
  const whatsapp = settings.whatsapp || '0349-5272815';
  const address = settings.address || 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan';
  const mapUrl = settings.map_url || 'https://maps.google.com/maps?q=Madni+Street+Gillani+Town+Near+Wensum+College+D.I.+Khan&t=&z=15&ie=UTF8&iwloc=&output=embed';

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const internationalWa = cleanWhatsapp.startsWith('0') ? '92' + cleanWhatsapp.slice(1) : cleanWhatsapp;

  // Group services
  const gynServices = services.filter((s) => s.category === 'Gynaecology');
  const skinServices = services.filter((s) => s.category === 'Skin & Medical Care' || s.category !== 'Gynaecology');

  return (
    <>
      {/* ================= 2. HERO SECTION ================= */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-tag">
                <ShieldCheck size={16} />
                <span>Verified Private Clinic • D.I. Khan</span>
              </div>

              <h1 id="hero-heading" className="hero-title">
                Quality Healthcare With Compassion and Care
              </h1>

              <p className="hero-desc">
                Professional medical and women&apos;s healthcare services at Madni Clinic, D.I. Khan.
              </p>

              <div className="hero-actions">
                <Link href="/book-appointment" className="btn btn-primary btn-lg">
                  <Calendar size={18} />
                  <span>Book an Appointment</span>
                </Link>

                <Link href="/doctors" className="btn btn-outline btn-lg">
                  <Users size={18} />
                  <span>Meet Our Doctors</span>
                </Link>

                <a
                  href={`https://wa.me/${internationalWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                  aria-label="Chat on WhatsApp with Madni Clinic"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp Clinic</span>
                </a>
              </div>

              {/* Verified Trust Items */}
              <div className="hero-trust-list">
                <div className="hero-trust-item">
                  <CheckCircle2 size={18} />
                  <span>Qualified Medical Professionals</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={18} />
                  <span>Patient-Focused Care</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={18} />
                  <span>Convenient Appointments</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={18} />
                  <span>Professional Healthcare Environment</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hero-image-card">
              <div className="hero-image-wrapper">
                <Image
                  src="/images/clinic-hero.svg"
                  alt="Madni Clinic Healthcare Environment Visual"
                  width={560}
                  height={420}
                  priority
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. QUICK FEATURE BAR ================= */}
      <section className="features-bar" aria-label="Key Clinic Features">
        <div className="container">
          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Stethoscope size={22} />
              </div>
              <div>
                <h3 className="feature-title">Professional Medical Care</h3>
                <p className="feature-desc">Qualified clinical assessments and dedicated healthcare guidance.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Heart size={22} />
              </div>
              <div>
                <h3 className="feature-title">Women&apos;s Healthcare</h3>
                <p className="feature-desc">Specialized gynaecological care and supportive maternal wellness.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="feature-title">Skin &amp; Medical Care</h3>
                <p className="feature-desc">Targeted skin health evaluations and medical specialist consultations.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="feature-box">
              <div className="feature-icon-wrapper">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="feature-title">Easy Appointment Booking</h3>
                <p className="feature-desc">Simple online slot reservations with verified double-booking protection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. ABOUT SECTION ================= */}
      <section className="section" aria-labelledby="about-heading">
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span className="section-badge">About Us</span>
            <h2 id="about-heading" className="section-title" style={{ fontSize: '2.1rem', marginBottom: '1.25rem' }}>
              About Madni Clinic
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Madni Clinic provides professional healthcare services with a focus on patient care, convenience and personalized medical attention. Located on Madni Street, Gillani Town near Wensum College in D.I. Khan, we are committed to providing a clean, respectful, and organized clinical setting for our community.
            </p>
            <Link href="/about" className="btn btn-outline">
              <span>Learn More About Our Clinic</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 5. DOCTORS SECTION ================= */}
      <section className="section section-alt" aria-labelledby="doctors-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Specialists</span>
            <h2 id="doctors-heading" className="section-title">
              Meet Our Doctors
            </h2>
            <p className="section-subtitle">
              Consult with qualified medical professionals dedicated to clinical excellence and personalized patient attention.
            </p>
          </div>

          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. SERVICES SECTION ================= */}
      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Clinical Offerings</span>
            <h2 id="services-heading" className="section-title">
              Clinical Services
            </h2>
            <p className="section-subtitle">
              Comprehensive consultations across Women&apos;s Health, Dermatology, and Specialist Medical Care.
            </p>
          </div>

          {/* Category 1: Gynaecology */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--color-border)' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
                <Heart size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>Gynaecology Services</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Under the care of Lady Dr. Sana Bashir (Gynaecologist)
                </span>
              </div>
            </div>

            <div className="services-grid">
              {gynServices.slice(0, 4).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>

          {/* Category 2: Skin & Medical Care */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--color-border)' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-secondary-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-secondary)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>Skin &amp; Medical Care Services</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Under the care of Dr. Sharjeel (Skin Specialist – Medical Specialist)
                </span>
              </div>
            </div>

            <div className="services-grid">
              {skinServices.slice(0, 4).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/services" className="btn btn-outline">
              <span>View All Clinic Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 7. WHY CHOOSE MADNI CLINIC ================= */}
      <section className="section section-alt" aria-labelledby="why-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Commitment</span>
            <h2 id="why-heading" className="section-title">
              Why Choose Madni Clinic
            </h2>
            <p className="section-subtitle">
              We focus on dependable clinical standards, clear communication, and dignified patient care.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <Award size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Qualified Medical Professionals</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)' }}>
                Consultations conducted by credentialed doctors with recognized professional medical qualifications.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <Calendar size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Convenient Appointment Booking</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)' }}>
                Reserved time slots designed to minimize waiting room delays and ensure personalized attention.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <Heart size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Patient-Focused Care</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)' }}>
                Attentive and respectful clinical consultations tailored to your individual healthcare needs.
              </p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                <MessageCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Easy WhatsApp Contact</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)' }}>
                Fast communication and appointment verification via our official clinic WhatsApp desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. HOW APPOINTMENT WORKS ================= */}
      <section className="section" aria-labelledby="steps-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Booking Process</span>
            <h2 id="steps-heading" className="section-title">
              How to Book an Appointment
            </h2>
            <p className="section-subtitle">
              Schedule your visit in 5 straightforward steps with instant confirmation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              { num: '1', title: 'Select Doctor', desc: 'Choose Lady Dr. Sana Bashir or Dr. Sharjeel.' },
              { num: '2', title: 'Choose Date', desc: 'Pick your preferred date on the calendar.' },
              { num: '3', title: 'Select Available Time', desc: 'View live open time slots.' },
              { num: '4', title: 'Enter Patient Details', desc: 'Provide name, phone, and reason.' },
              { num: '5', title: 'Confirm Appointment', desc: 'Receive your unique reference number.' },
            ].map((st) => (
              <div
                key={st.num}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {st.num}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{st.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/book-appointment" className="btn btn-primary btn-lg">
              <Calendar size={18} />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 9. TESTIMONIALS (ONLY IF GENUINE TESTIMONIALS EXIST) ================= */}
      {testimonials.length > 0 && (
        <section className="section section-alt" aria-labelledby="testimonials-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-badge">Patient Experiences</span>
              <h2 id="testimonials-heading" className="section-title">
                Patient Feedback
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {testimonials.map((t) => (
                <div key={t.id} className="card">
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    {t.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 10. CLINIC INFORMATION ================= */}
      <section className="section section-alt" aria-labelledby="info-heading">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Verified Location</span>
            <h2 id="info-heading" className="section-title">
              Clinic Information
            </h2>
            <p className="section-subtitle">
              Visit us or reach out directly through our verified channels in Dera Ismail Khan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Address</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {address}
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: 'var(--radius-md)' }}>
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Official WhatsApp</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  {whatsapp}
                </p>
                <a
                  href={`https://wa.me/${internationalWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#E0F2FE', color: '#0284C7', borderRadius: 'var(--radius-md)' }}>
                <Phone size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Phone Consultation</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  {phone}
                </p>
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="btn btn-outline btn-sm">
                  <span>Call Clinic</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 11. GOOGLE MAPS ================= */}
      <section className="section" style={{ paddingTop: 0 }} aria-label="Clinic Map Location">
        <div className="container">
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              height: '420px',
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
              title="Madni Clinic Google Maps Location"
            />
          </div>
        </div>
      </section>

      {/* ================= 12. BOOK APPOINTMENT CTA BANNER ================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, #155E75 0%, #0F766E 100%)',
          color: '#FFFFFF',
          padding: '4.5rem 0',
          textAlign: 'center',
        }}
        aria-label="Appointment Call to Action"
      >
        <div className="container" style={{ maxWidth: '750px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '2.25rem', marginBottom: '1rem' }}>
            Book Your Consultation at Madni Clinic
          </h2>
          <p style={{ color: '#E0F2FE', fontSize: '1.1rem', marginBottom: '2.25rem', lineHeight: 1.6 }}>
            Consult with Lady Dr. Sana Bashir (Gynaecologist) or Dr. Sharjeel (Skin Specialist – Medical Specialist) in D.I. Khan.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/book-appointment" className="btn btn-lg" style={{ backgroundColor: '#FFFFFF', color: 'var(--color-primary)' }}>
              <Calendar size={18} />
              <span>Book an Appointment</span>
            </Link>
            <a
              href={`https://wa.me/${internationalWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
      {/* 13. Footer is rendered by layout */}
    </>
  );
}
