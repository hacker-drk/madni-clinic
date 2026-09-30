'use client';

import React, { useState } from 'react';
import { validatePakistaniPhone } from '@/lib/utils';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!phone.trim()) {
      errs.phone = 'Please enter your phone number.';
    } else if (!validatePakistaniPhone(phone)) {
      errs.phone = 'Please enter a valid Pakistani phone number (03XXXXXXXXX).';
    }
    if (!message.trim()) errs.message = 'Please enter your message.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to submit form.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch {
      setServerError('Something went wrong. Please try again or contact Madni Clinic.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'var(--color-success-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #BBF7D0',
          textAlign: 'center',
        }}
        role="status"
      >
        <CheckCircle size={40} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: '#14532D', marginBottom: '0.5rem' }}>Thank you. Your message has been received.</h3>
        <p style={{ color: '#166534', fontSize: '0.92rem' }}>
          Our clinic reception will get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="btn btn-outline"
          style={{ marginTop: '1.25rem' }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div
          style={{
            padding: '1rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            color: '#991B1B',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="contact-name" className="form-label">
          Full Name <span className="req">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ahmad Ali"
          className={`form-input ${errors.name ? 'is-invalid' : ''}`}
        />
        {errors.name && <div className="form-error-msg">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="contact-phone" className="form-label">
          Phone Number <span className="req">*</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0349-5272815"
          className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
        />
        {errors.phone ? (
          <div className="form-error-msg">{errors.phone}</div>
        ) : (
          <div className="form-hint">Format: 03XXXXXXXXX</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contact-email" className="form-label">
          Email Address <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Optional)</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contact-message" className="form-label">
          Message <span className="req">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your clinical inquiry or question..."
          className={`form-textarea ${errors.message ? 'is-invalid' : ''}`}
        />
        {errors.message && <div className="form-error-msg">{errors.message}</div>}
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        <Send size={16} />
        <span>{loading ? 'Sending message...' : 'Send Message'}</span>
      </button>
    </form>
  );
}
