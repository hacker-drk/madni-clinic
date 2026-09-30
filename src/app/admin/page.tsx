'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { Appointment } from '@/lib/types';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  XCircle,
  ArrowRight,
  RefreshCw,
  Phone,
  Trash2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: {
      total: number;
      today: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      upcoming: number;
    };
    recentAppointments: Appointment[];
    todaysAppointments: Appointment[];
  } | null>(null);

  const loadStats = () => {
    setLoading(true);
    fetch('/api/appointments/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading stats', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleQuickStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadStats();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, { method: 'DELETE' });
      if (res.ok) {
        loadStats();
      } else {
        alert('Failed to delete appointment.');
      }
    } catch (e) {
      console.error('Failed to delete appointment', e);
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Clinic Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Live overview of patient consultations, appointment statuses, and clinic operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={loadStats} className="btn btn-outline btn-sm">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <Link href="/admin/appointments" className="btn btn-primary btn-sm">
            <span>Manage All Appointments</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading dashboard statistics...
        </div>
      ) : (
        <>
          {/* Section 36: Stats Grid */}
          <div className="stats-grid">
            {/* Today */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-val">{data?.stats.today || 0}</div>
                <div className="stat-label">Today&apos;s Appointments</div>
              </div>
            </div>

            {/* Pending */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="stat-val">{data?.stats.pending || 0}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>

            {/* Confirmed */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="stat-val">{data?.stats.confirmed || 0}</div>
                <div className="stat-label">Confirmed Slots</div>
              </div>
            </div>

            {/* Completed */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-val">{data?.stats.completed || 0}</div>
                <div className="stat-label">Completed Consultations</div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                <XCircle size={24} />
              </div>
              <div>
                <div className="stat-val">{data?.stats.cancelled || 0}</div>
                <div className="stat-label">Cancelled</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '2rem' }}>
            {/* Today's Appointments List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Today&apos;s Appointments</h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {new Date().toLocaleDateString('en-GB', { dateStyle: 'full' })}
                </span>
              </div>

              <div className="table-container">
                {(!data?.todaysAppointments || data.todaysAppointments.length === 0) ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No appointments scheduled for today yet.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.todaysAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>{apt.appointment_time}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.patient_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{apt.phone}</div>
                          </td>
                          <td>{apt.doctor_name}</td>
                          <td>{getStatusBadge(apt.status)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {apt.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(apt.id, 'Confirmed')}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Confirm
                                </button>
                              )}
                              {apt.status === 'Confirmed' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(apt.id, 'Completed')}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Complete
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="btn btn-outline btn-sm"
                                style={{ color: '#DC2626', borderColor: '#FECACA', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                title="Delete Appointment"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Appointments Activity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Recent Booking Activity</h2>
                <Link href="/admin/appointments" style={{ fontSize: '0.84rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              <div className="table-container">
                {(!data?.recentAppointments || data.recentAppointments.length === 0) ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No appointments recorded yet.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>
                              {apt.reference_number}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.patient_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              Dr: {apt.doctor_name}
                            </div>
                          </td>
                          <td>
                            <div>{apt.appointment_date}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                              {apt.appointment_time}
                            </div>
                          </td>
                          <td>{getStatusBadge(apt.status)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#DC2626', borderColor: '#FECACA', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              title="Delete Appointment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
