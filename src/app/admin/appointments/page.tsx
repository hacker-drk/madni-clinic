'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Appointment, Doctor } from '@/lib/types';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Phone,
  MessageCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Selected appointment for details modal
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (doctorFilter !== 'all') params.append('doctorId', doctorFilter);
    if (dateFilter) params.append('date', dateFilter);
    if (search.trim()) params.append('search', search.trim());

    fetch(`/api/appointments?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Load doctors for dropdown filter
    fetch('/api/doctors?all=true')
      .then((res) => res.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch((e) => console.error(e));

    fetchAppointments();
  }, [statusFilter, doctorFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: status as any } : apt))
        );
        if (selectedApt && selectedApt.id === id) {
          setSelectedApt({ ...selectedApt, status: status as any });
        }
      }
    } catch (e) {
      console.error('Update status error', e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-confirmed">Confirmed</span>;
      case 'Completed':
        return <span className="badge badge-completed">Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      case 'No Show':
        return <span className="badge badge-noshow">No Show</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Appointment Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Review, confirm, and update patient appointments with real-time double booking prevention.
          </p>
        </div>
        <button type="button" onClick={fetchAppointments} className="btn btn-outline btn-sm">
          <RefreshCw size={15} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {/* Search */}
          <div>
            <label className="form-label">Search Patient / Ref / Phone</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, phone, or APT-..."
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          {/* Doctor filter */}
          <div>
            <label className="form-label">Filter by Doctor</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="form-label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          {/* Date filter */}
          <div>
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Filter size={15} />
              <span>Filter</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDoctorFilter('all');
                setDateFilter('');
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Calendar size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>No appointments found.</h3>
            <p style={{ fontSize: '0.875rem' }}>Try clearing filters or search terms.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Patient Details</th>
                <th>Doctor</th>
                <th>Appointment Date &amp; Time</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                      {apt.reference_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{apt.patient_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {apt.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{apt.doctor_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {apt.doctor_specialization}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{apt.appointment_date}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {apt.appointment_time}
                    </div>
                  </td>
                  <td>{getStatusBadge(apt.status)}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {apt.created_at ? new Date(apt.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedApt(apt)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.55rem' }}
                        title="View Full Details"
                      >
                        <Eye size={14} />
                      </button>

                      {apt.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(apt.id, 'Completed')}
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--color-success)', color: '#FFFFFF', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Complete
                        </button>
                      )}

                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(apt.id, 'Cancelled')}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--color-error)', borderColor: '#FECACA', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointment Detail Modal (Section 38) */}
      {selectedApt && (
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
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Appointment Details</h3>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                  {selectedApt.reference_number}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                style={{ padding: '0.4rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="info-list" style={{ margin: '0 0 1.5rem 0' }}>
              <div className="info-item">
                <span className="info-key">Patient Name:</span>
                <span className="info-val">{selectedApt.patient_name}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Phone / WhatsApp:</span>
                <span className="info-val">{selectedApt.phone}</span>
              </div>
              {selectedApt.email && (
                <div className="info-item">
                  <span className="info-key">Email:</span>
                  <span className="info-val">{selectedApt.email}</span>
                </div>
              )}
              {selectedApt.age && (
                <div className="info-item">
                  <span className="info-key">Age / Gender:</span>
                  <span className="info-val">{selectedApt.age} yrs / {selectedApt.gender || 'Not specified'}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-key">Doctor:</span>
                <span className="info-val">{selectedApt.doctor_name}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Date:</span>
                <span className="info-val">{selectedApt.appointment_date}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Time Slot:</span>
                <span className="info-val">{selectedApt.appointment_time}</span>
              </div>
              <div className="info-item">
                <span className="info-key">Current Status:</span>
                <span className="info-val">{getStatusBadge(selectedApt.status)}</span>
              </div>
              {selectedApt.reason && (
                <div className="info-item">
                  <span className="info-key">Reason for Visit:</span>
                  <span className="info-val">{selectedApt.reason}</span>
                </div>
              )}
              {selectedApt.notes && (
                <div className="info-item">
                  <span className="info-key">Patient Notes:</span>
                  <span className="info-val">{selectedApt.notes}</span>
                </div>
              )}
            </div>

            {/* Quick Actions inside Modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Update Appointment Status:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Confirmed')}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#0284C7', borderColor: '#BAE6FD' }}
                >
                  Mark Confirmed
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Completed')}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#16A34A', borderColor: '#BBF7D0' }}
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedApt.id, 'No Show')}
                  className="btn btn-outline btn-sm"
                >
                  Mark No Show
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedApt.id, 'Cancelled')}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#DC2626', borderColor: '#FECACA' }}
                >
                  Cancel Slot
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <a
                  href={`tel:${selectedApt.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  <Phone size={15} />
                  <span>Call Patient</span>
                </a>
                <a
                  href={`https://wa.me/92${selectedApt.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-sm"
                  style={{ flex: 1 }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
