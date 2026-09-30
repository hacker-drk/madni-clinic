'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ClinicSettings } from '@/lib/types';
import { Settings, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<ClinicSettings>>({});
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSettings = () => {
    setLoading(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((d) => {
        setSettings(d.settings || {});
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update settings.');
        return;
      }

      setSavedMessage('Clinic settings updated successfully! Public website updated.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch {
      setErrorMessage('Server error.');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Clinic Configuration &amp; Settings</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Modify clinic contact information, WhatsApp hotline, address, opening hours, and maps embed.
          </p>
        </div>
        <button type="button" onClick={fetchSettings} className="btn btn-outline btn-sm">
          <RefreshCw size={15} />
          <span>Reload Settings</span>
        </button>
      </div>

      {savedMessage && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{savedMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading clinic configuration...
        </div>
      ) : (
        <form onSubmit={handleSave} className="card" style={{ maxWidth: '850px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Clinic Name */}
            <div className="form-group">
              <label className="form-label">Clinic Name <span className="req">*</span></label>
              <input
                type="text"
                required
                value={settings.clinic_name || ''}
                onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Currency */}
            <div className="form-group">
              <label className="form-label">Currency</label>
              <input
                type="text"
                value={settings.currency || 'PKR'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Official WhatsApp */}
            <div className="form-group">
              <label className="form-label">Official WhatsApp Number <span className="req">*</span></label>
              <input
                type="text"
                required
                value={settings.whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="0349-5272815"
                className="form-input"
              />
              <div className="form-hint">Used for all WhatsApp chat links across the site.</div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Clinic Calling Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="0349-5272815"
                className="form-input"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Clinic Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@madniclinic.com"
                className="form-input"
              />
            </div>

            {/* Opening Hours */}
            <div className="form-group">
              <label className="form-label">Opening Hours</label>
              <input
                type="text"
                value={settings.opening_hours || ''}
                onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                placeholder="Monday – Saturday: 09:00 AM – 08:00 PM | Sunday: Closed"
                className="form-input"
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Clinic Physical Address <span className="req">*</span></label>
            <textarea
              rows={2}
              required
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="form-textarea"
            />
          </div>

          {/* Google Maps Embed URL */}
          <div className="form-group">
            <label className="form-label">Google Maps Embed URL</label>
            <input
              type="text"
              value={settings.map_url || ''}
              onChange={(e) => setSettings({ ...settings, map_url: e.target.value })}
              placeholder="https://maps.google.com/maps?q=..."
              className="form-input"
            />
            <div className="form-hint">Paste the Google Maps embed iframe src URL.</div>
          </div>

          {/* Consultation Fee Note Placeholder */}
          <div className="form-group">
            <label className="form-label">Consultation Fee Policy Note</label>
            <input
              type="text"
              value={settings.consultation_fee_note || ''}
              onChange={(e) => setSettings({ ...settings, consultation_fee_note: e.target.value })}
              placeholder="Information will be updated soon."
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} />
              <span>Save &amp; Update Live Site</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
