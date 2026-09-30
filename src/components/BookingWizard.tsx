'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Doctor, Appointment } from '@/lib/types';
import { TimeSlot, validatePakistaniPhone } from '@/lib/utils';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Printer,
  Home,
  Check
} from 'lucide-react';

interface BookingWizardProps {
  doctors: Doctor[];
  initialDoctorId?: number;
  clinicWhatsapp?: string;
  clinicPhone?: string;
}

export function BookingWizard({
  doctors,
  initialDoctorId,
  clinicWhatsapp = '0349-5272815',
  clinicPhone = '0349-5272815',
}: BookingWizardProps) {
  // Wizard steps: 1: Doctor, 2: Date & Time, 3: Patient Info, 4: Review, 5: Confirmed
  const [step, setStep] = useState<number>(initialDoctorId ? 2 : 1);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    initialDoctorId || (doctors.length > 0 ? doctors[0].id : null)
  );

  // Date selection (default: today or tomorrow formatted YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Slots State
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [slotsData, setSlotsData] = useState<{
    isWorkingDay: boolean;
    isDateBlocked: boolean;
    blockedReason?: string;
    slots: TimeSlot[];
  } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient Info State
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('Female');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Validation & Submission
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    let isMounted = true;
    setSlotsLoading(true);
    setSelectedTime('');

    fetch(`/api/slots?doctorId=${selectedDoctorId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setSlotsData(data);
        setSlotsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load slots', err);
        setSlotsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDoctorId, selectedDate]);

  // Validation handler for Patient Info step
  const validatePatientInfo = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!patientName.trim()) {
      errs.patientName = 'Please enter your full name.';
    }

    if (!patientPhone.trim()) {
      errs.patientPhone = 'Please enter your phone number.';
    } else if (!validatePakistaniPhone(patientPhone)) {
      errs.patientPhone = 'Please enter a valid Pakistani phone number (e.g. 0349-5272815 or 03001234567).';
    }

    if (!reason.trim()) {
      errs.reason = 'Please provide a brief reason for your consultation.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromDoctor = () => {
    if (!selectedDoctorId) {
      setErrors({ doctor: 'Please select a doctor.' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleNextFromDateTime = () => {
    const errs: { [key: string]: string } = {};
    if (!selectedDate) {
      errs.date = 'Please select an appointment date.';
    }
    if (!selectedTime) {
      errs.time = 'Please select an available time slot.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep(3);
  };

  const handleNextFromPatientInfo = () => {
    if (validatePatientInfo()) {
      setStep(4); // Review
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          phone: patientPhone,
          email: patientEmail || null,
          age: patientAge ? parseInt(patientAge, 10) : null,
          gender: patientGender,
          doctor_id: selectedDoctorId,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          reason,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || 'This appointment slot is no longer available. Please select another time.');
        setSubmitting(false);
        return;
      }

      setConfirmedAppointment(data.appointment);
      setStep(5); // Confirmed!
    } catch (err: any) {
      setSubmitError('Something went wrong. Please try again or contact Madni Clinic.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp click handler with prefilled appointment template
  const getWhatsAppLink = (appointment: Appointment) => {
    const cleanWa = clinicWhatsapp.replace(/[^0-9]/g, '');
    const intWa = cleanWa.startsWith('0') ? '92' + cleanWa.slice(1) : cleanWa;

    const message = `Hello, I would like to confirm my appointment.

Patient: ${appointment.patient_name}
Doctor: ${appointment.doctor_name || selectedDoctor?.name}
Date: ${appointment.appointment_date}
Time: ${appointment.appointment_time}
Appointment Reference: ${appointment.reference_number}`;

    return `https://wa.me/${intWa}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="booking-wizard">
      {/* Wizard Progress Indicator */}
      {step < 5 && (
        <nav className="wizard-steps-bar" aria-label="Appointment Progress">
          <div className={`wizard-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? <Check size={14} /> : '1'}</span>
            <span>Doctor</span>
          </div>

          <div className={`wizard-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span className="step-num">{step > 2 ? <Check size={14} /> : '2'}</span>
            <span>Date &amp; Time</span>
          </div>

          <div className={`wizard-step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            <span className="step-num">{step > 3 ? <Check size={14} /> : '3'}</span>
            <span>Patient Info</span>
          </div>

          <div className={`wizard-step-item ${step === 4 ? 'active' : ''}`}>
            <span className="step-num">4</span>
            <span>Review</span>
          </div>
        </nav>
      )}

      <div className="wizard-content">
        {/* ================= STEP 1: SELECT DOCTOR ================= */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Select a Doctor</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
              Choose the verified specialist you would like to book a consultation with.
            </p>

            {errors.doctor && (
              <div style={{ color: 'var(--color-error)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} />
                <span>{errors.doctor}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {doctors.map((doctor) => {
                const isSelected = selectedDoctorId === doctor.id;
                return (
                  <div
                    key={doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-soft)' : '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={15} />
                      </div>
                    )}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-secondary)',
                        backgroundColor: 'var(--color-secondary-light)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        marginBottom: '0.6rem',
                      }}
                    >
                      {doctor.specialization}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{doctor.name}</h3>
                    {doctor.qualification && doctor.qualification !== 'Information will be updated soon.' && (
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                        {doctor.qualification}
                      </p>
                    )}
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {doctor.biography}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={handleNextFromDoctor}>
                <span>Continue to Date &amp; Time</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT DATE & TIME ================= */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Select Date &amp; Time</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Booking for: <strong>{selectedDoctor?.name}</strong> ({selectedDoctor?.specialization})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline btn-sm"
              >
                Change Doctor
              </button>
            </div>

            {/* Date Picker Section */}
            <div className="form-group" style={{ maxWidth: '360px', marginBottom: '1.75rem' }}>
              <label htmlFor="appointment-date" className="form-label">
                Appointment Date <span className="req">*</span>
              </label>
              <input
                id="appointment-date"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`form-input ${errors.date ? 'is-invalid' : ''}`}
              />
              {errors.date && <div className="form-error-msg">{errors.date}</div>}
              <div className="form-hint">Select any date within the next 30 days.</div>
            </div>

            {/* Time Slot Picker */}
            <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label className="form-label">
                Available Time Slots <span className="req">*</span>
              </label>

              {slotsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                  <Clock size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem auto', color: 'var(--color-primary)' }} />
                  <div>Checking doctor availability...</div>
                </div>
              ) : slotsData?.isDateBlocked ? (
                <div style={{ padding: '1.5rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
                  <strong>Doctor is unavailable on this date.</strong>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {slotsData.blockedReason || 'Please select another date on the calendar above.'}
                  </div>
                </div>
              ) : !slotsData?.isWorkingDay ? (
                <div style={{ padding: '1.5rem', background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
                  <strong>No scheduled clinic hours on this day.</strong>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Please choose another day (e.g., Monday through Saturday).
                  </div>
                </div>
              ) : slotsData?.slots.length === 0 ? (
                <div style={{ padding: '1.5rem', background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
                  No available slots for this date. Please select another date.
                </div>
              ) : (
                <>
                  <div className="slots-grid">
                    {slotsData?.slots.map((slot) => {
                      const isSelected = selectedTime === slot.time24;
                      return (
                        <button
                          key={slot.time24}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time24)}
                          className={`slot-btn ${isSelected ? 'selected' : ''}`}
                          title={!slot.available ? slot.reason || 'Unavailable' : 'Available'}
                        >
                          {slot.time12}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && <div className="form-error-msg" style={{ marginTop: '0.65rem' }}>{errors.time}</div>}
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextFromDateTime}
                disabled={!selectedTime}
              >
                <span>Continue to Patient Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PATIENT INFORMATION ================= */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Patient Information</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              Please enter accurate patient details so the clinic staff can prepare your consultation file.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="patient-name" className="form-label">
                  Patient Full Name <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="patient-name"
                    type="text"
                    placeholder="e.g. Fatima Khan"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className={`form-input ${errors.patientName ? 'is-invalid' : ''}`}
                  />
                </div>
                {errors.patientName && <div className="form-error-msg">{errors.patientName}</div>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="patient-phone" className="form-label">
                  WhatsApp / Phone Number <span className="req">*</span>
                </label>
                <input
                  id="patient-phone"
                  type="tel"
                  placeholder="0349-5272815 or 03001234567"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className={`form-input ${errors.patientPhone ? 'is-invalid' : ''}`}
                />
                {errors.patientPhone ? (
                  <div className="form-error-msg">{errors.patientPhone}</div>
                ) : (
                  <div className="form-hint">Pakistani mobile format (03XXXXXXXXX).</div>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="form-group">
                <label htmlFor="patient-email" className="form-label">
                  Email Address <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  id="patient-email"
                  type="email"
                  placeholder="name@example.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Age & Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label htmlFor="patient-age" className="form-label">Age</label>
                  <input
                    id="patient-age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="patient-gender" className="form-label">Gender</label>
                  <select
                    id="patient-gender"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="form-select"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="form-group">
              <label htmlFor="visit-reason" className="form-label">
                Reason for Visit <span className="req">*</span>
              </label>
              <input
                id="visit-reason"
                type="text"
                placeholder="e.g. Routine gynaecology checkup, Skin rash, Medical checkup"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`form-input ${errors.reason ? 'is-invalid' : ''}`}
              />
              {errors.reason && <div className="form-error-msg">{errors.reason}</div>}
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label htmlFor="patient-notes" className="form-label">
                Additional Notes <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                id="patient-notes"
                rows={2}
                placeholder="Any previous health history or specific questions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button type="button" className="btn btn-primary" onClick={handleNextFromPatientInfo}>
                <span>Review Appointment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & CONFIRM ================= */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Review Appointment</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Please verify all appointment details before completing your request.
            </p>

            {submitError && (
              <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            <div className="info-list">
              <div className="info-item">
                <span className="info-key">Doctor:</span>
                <span className="info-val">{selectedDoctor?.name} ({selectedDoctor?.specialization})</span>
              </div>
              <div className="info-item">
                <span className="info-key">Appointment Date:</span>
                <span className="info-val">{selectedDate}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Scheduled Time:</span>
                <span className="info-val">{selectedTime}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Patient Name:</span>
                <span className="info-val">{patientName}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Contact Phone:</span>
                <span className="info-val">{patientPhone}</span>
              </div>
              {patientAge && (
                <div className="info-item">
                  <span className="info-key">Age / Gender:</span>
                  <span className="info-val">{patientAge} yrs / {patientGender}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-key">Reason for Visit:</span>
                <span className="info-val">{reason}</span>
              </div>
              {notes && (
                <div className="info-item">
                  <span className="info-key">Notes:</span>
                  <span className="info-val">{notes}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(3)}
                disabled={submitting}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Booking appointment...</span>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: CONFIRMATION ================= */}
        {step === 5 && confirmedAppointment && (
          <div className="confirmation-card" aria-live="polite">
            <div className="confirmation-badge-icon">
              <CheckCircle size={40} />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              Your appointment request has been received.
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Madni Clinic staff will review your booking. Please save your reference number below.
            </p>

            <div className="ref-box">
              <div className="ref-label">Appointment Reference</div>
              <div className="ref-value">{confirmedAppointment.reference_number}</div>
            </div>

            <div className="info-list">
              <div className="info-item">
                <span className="info-key">Patient:</span>
                <span className="info-val">{confirmedAppointment.patient_name}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Doctor:</span>
                <span className="info-val">{confirmedAppointment.doctor_name || selectedDoctor?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Date:</span>
                <span className="info-val">{confirmedAppointment.appointment_date}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Time:</span>
                <span className="info-val">{confirmedAppointment.appointment_time}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Status:</span>
                <span className="badge badge-pending">Pending Confirmation</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
              <a
                href={getWhatsAppLink(confirmedAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Clinic</span>
              </a>

              <a
                href={`tel:${clinicPhone.replace(/[^0-9+]/g, '')}`}
                className="btn btn-outline"
              >
                <Phone size={18} />
                <span>Call Clinic</span>
              </a>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={18} />
                <span>Print Slip</span>
              </button>

              <Link href="/" className="btn btn-primary">
                <Home size={18} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
