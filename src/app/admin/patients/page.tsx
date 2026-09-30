'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Users, Search, Phone, Calendar, Mail, ShieldCheck, Trash2 } from 'lucide-react';

interface PatientRecord {
  patient_name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  total_appointments: number;
  last_appointment_date: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());

    fetch(`/api/patients?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((d) => {
        setPatients(d.patients || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDeletePatient = async (phone: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete all records for patient ${name} (${phone})?`)) return;
    try {
      const res = await fetch(`/api/patients?phone=${encodeURIComponent(phone)}`, { method: 'DELETE' });
      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p.phone !== phone));
      } else {
        alert('Failed to delete patient records.');
      }
    } catch (e) {
      console.error('Delete patient error', e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Patient Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Protected records of clinic patients compiled securely from appointment bookings.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.3rem', width: '260px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 1rem auto', color: 'var(--color-text-muted)' }} />
            <h3 style={{ fontSize: '1.15rem' }}>No patient records found.</h3>
            <p style={{ fontSize: '0.85rem' }}>Records are compiled as patients book consultations.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Age / Gender</th>
                <th>Total Consultations</th>
                <th>Last Visit Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.patient_name}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.phone}</span>
                  </td>
                  <td>
                    {p.email ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{p.email}</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      {p.age ? `${p.age} yrs` : '—'} {p.gender ? `• ${p.gender}` : ''}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      {p.total_appointments} {p.total_appointments === 1 ? 'visit' : 'visits'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {p.last_appointment_date || '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeletePatient(p.phone, p.patient_name)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#DC2626', borderColor: '#FECACA', padding: '0.25rem 0.55rem' }}
                      title="Delete Patient Records"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
