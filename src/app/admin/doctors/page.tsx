'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Doctor } from '@/lib/types';
import {
  UserCheck,
  Edit2,
  Plus,
  CheckCircle,
  XCircle,
  Save,
  X,
  Award,
  Phone,
  MessageCircle,
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchDoctors = () => {
    setLoading(true);
    fetch('/api/doctors?all=true')
      .then((res) => res.json())
      .then((d) => {
        setDoctors(d.doctors || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleEditClick = (doc: Doctor) => {
    setEditingDoctor({ ...doc });
    setIsNew(false);
    setSaveSuccess('');
    setSaveError('');
  };

  const handleAddNewClick = () => {
    setEditingDoctor({
      name: '',
      slug: '',
      title: 'Dr.',
      qualification: 'Information will be updated soon.',
      specialization: '',
      professional_affiliation: 'Information will be updated soon.',
      biography: '',
      experience: 'Information will be updated soon.',
      consultation_fee: 'Information will be updated soon.',
      photo: '/images/dr-sharjeel.svg',
      phone: '0349-5272815',
      whatsapp: '0349-5272815',
      active: 1,
    });
    setIsNew(true);
    setSaveSuccess('');
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    setSaveError('');
    setSaveSuccess('');

    const url = isNew ? '/api/doctors' : `/api/doctors/${editingDoctor.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDoctor),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Failed to save doctor.');
        return;
      }

      setSaveSuccess(isNew ? 'Doctor added successfully.' : 'Doctor details updated successfully.');
      setTimeout(() => {
        setEditingDoctor(null);
        fetchDoctors();
      }, 1200);
    } catch {
      setSaveError('Server error while saving.');
    }
  };

  const handleToggleActive = async (doc: Doctor) => {
    const updatedStatus = doc.active ? 0 : 1;
    try {
      const res = await fetch(`/api/doctors/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updatedStatus }),
      });
      if (res.ok) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, active: updatedStatus } : d))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Doctor Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Manage verified doctor credentials, specializations, biographies, and active booking availability.
          </p>
        </div>
        <button type="button" onClick={handleAddNewClick} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctors Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {doctors.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${doc.active ? 'var(--color-border)' : '#FCA5A5'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xs)',
              opacity: doc.active ? 1 : 0.75,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: doc.active ? 'var(--color-secondary)' : '#991B1B',
                    backgroundColor: doc.active ? 'var(--color-secondary-light)' : '#FEE2E2',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {doc.specialization}
                </span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{doc.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {doc.qualification}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleToggleActive(doc)}
                  className="btn btn-outline btn-sm"
                  title={doc.active ? 'Disable Doctor' : 'Enable Doctor'}
                  style={{
                    color: doc.active ? 'var(--color-success)' : 'var(--color-error)',
                    borderColor: doc.active ? '#BBF7D0' : '#FECACA',
                  }}
                >
                  {doc.active ? <CheckCircle size={15} /> : <XCircle size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditClick(doc)}
                  className="btn btn-outline btn-sm"
                  title="Edit Doctor"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            </div>

            {doc.professional_affiliation && doc.professional_affiliation !== 'Information will be updated soon.' && (
              <div style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} />
                <span>{doc.professional_affiliation}</span>
              </div>
            )}

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {doc.biography}
            </p>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              <div>
                <strong>Phone:</strong> {doc.phone || '0349-5272815'}
              </div>
              <div>
                <strong>WhatsApp:</strong> {doc.whatsapp || '0349-5272815'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingDoctor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                {isNew ? 'Add New Doctor' : `Edit ${editingDoctor.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                style={{ padding: '0.4rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {saveSuccess && (
              <div style={{ padding: '0.75rem 1rem', background: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Doctor Name <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.name || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={editingDoctor.title || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, title: e.target.value })}
                    placeholder="e.g. Lady Dr. or Dr."
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">URL Slug <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.slug || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, slug: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.specialization || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input
                  type="text"
                  value={editingDoctor.qualification || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, qualification: e.target.value })}
                  placeholder="e.g. MBBS, DOWH"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Affiliation</label>
                <input
                  type="text"
                  value={editingDoctor.professional_affiliation || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, professional_affiliation: e.target.value })}
                  placeholder="e.g. Royal College of Physician (Ireland)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea
                  rows={3}
                  value={editingDoctor.biography || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, biography: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    value={editingDoctor.phone || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    type="text"
                    value={editingDoctor.whatsapp || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, whatsapp: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    value={editingDoctor.experience || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee</label>
                  <input
                    type="text"
                    value={editingDoctor.consultation_fee || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, consultation_fee: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditingDoctor(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
