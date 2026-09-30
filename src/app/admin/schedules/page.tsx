'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Doctor, Schedule, BlockedDate, BlockedSlot } from '@/lib/types';
import { formatTime12 } from '@/lib/utils';
import {
  Clock,
  Calendar,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Ban,
} from 'lucide-react';

export default function AdminSchedulesPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // New blocked date form
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedDateReason, setNewBlockedDateReason] = useState('');

  // New blocked slot form
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotReason, setNewSlotReason] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const daysOfWeek = [
    { dow: 1, name: 'Monday' },
    { dow: 2, name: 'Tuesday' },
    { dow: 3, name: 'Wednesday' },
    { dow: 4, name: 'Thursday' },
    { dow: 5, name: 'Friday' },
    { dow: 6, name: 'Saturday' },
    { dow: 0, name: 'Sunday' },
  ];

  const fetchDoctorData = (docId: number) => {
    setLoading(true);
    fetch(`/api/schedules?doctorId=${docId}`)
      .then((res) => res.json())
      .then((d) => {
        setSchedules(d.schedules || []);
        setBlockedDates(d.blockedDates || []);
        setBlockedSlots(d.blockedSlots || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/doctors?all=true')
      .then((res) => res.json())
      .then((d) => {
        const docs = d.doctors || [];
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoctorId(docs[0].id);
          fetchDoctorData(docs[0].id);
        }
      });
  }, []);

  const handleDoctorChange = (id: number) => {
    setSelectedDoctorId(id);
    fetchDoctorData(id);
    setMessage('');
    setError('');
  };

  const handleScheduleChange = (
    dow: number,
    field: keyof Schedule,
    val: any
  ) => {
    setSchedules((prev) => {
      const existing = prev.find((s) => s.day_of_week === dow);
      if (existing) {
        return prev.map((s) => (s.day_of_week === dow ? { ...s, [field]: val } : s));
      } else {
        const dayObj = daysOfWeek.find((d) => d.dow === dow);
        const newSched: Schedule = {
          id: 0,
          doctor_id: selectedDoctorId,
          day_of_week: dow,
          day_name: dayObj?.name || 'Day',
          start_time: '09:00',
          end_time: '14:00',
          break_start: '12:00',
          break_end: '12:30',
          appointment_duration: 30,
          is_active: 1,
          [field]: val,
        };
        return [...prev, newSched];
      }
    });
  };

  const handleSaveSchedule = async (dow: number) => {
    setMessage('');
    setError('');
    const sched = schedules.find((s) => s.day_of_week === dow);
    if (!sched) return;

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sched),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save schedule.');
        return;
      }
      setMessage(`${sched.day_name} schedule saved.`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Server error.');
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;

    try {
      const res = await fetch('/api/schedules/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'date',
          doctor_id: selectedDoctorId,
          date: newBlockedDate,
          reason: newBlockedDateReason || 'Doctor unavailable',
        }),
      });

      if (res.ok) {
        setNewBlockedDate('');
        setNewBlockedDateReason('');
        fetchDoctorData(selectedDoctorId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBlocked = async (type: 'date' | 'slot', id: number) => {
    try {
      const res = await fetch(`/api/schedules/blocked?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDoctorData(selectedDoctorId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotTime) return;

    try {
      const res = await fetch('/api/schedules/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'slot',
          doctor_id: selectedDoctorId,
          date: newSlotDate,
          time: newSlotTime,
          reason: newSlotReason || 'Slot reserved',
        }),
      });

      if (res.ok) {
        setNewSlotDate('');
        setNewSlotTime('');
        setNewSlotReason('');
        fetchDoctorData(selectedDoctorId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Schedule &amp; Availability</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Configure clinic hours, breaks, slot duration, and blackout dates per doctor.
          </p>
        </div>

        {/* Doctor selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Doctor:</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => handleDoctorChange(parseInt(e.target.value, 10))}
            className="form-select"
            style={{ width: 'auto' }}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Weekly Working Days Table */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Weekly Working Hours &amp; Breaks</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Break Start</th>
                <th>Break End</th>
                <th>Slot (Mins)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => {
                const sched = schedules.find((s) => s.day_of_week === day.dow) || {
                  id: 0,
                  doctor_id: selectedDoctorId,
                  day_of_week: day.dow,
                  day_name: day.name,
                  start_time: '09:00',
                  end_time: '13:00',
                  break_start: '11:00',
                  break_end: '11:30',
                  appointment_duration: 30,
                  is_active: day.dow === 0 ? 0 : 1, // Sunday closed by default
                };

                return (
                  <tr key={day.dow} style={{ opacity: sched.is_active ? 1 : 0.65 }}>
                    <td><strong>{day.name}</strong></td>
                    <td>
                      <select
                        value={sched.is_active ? '1' : '0'}
                        onChange={(e) => handleScheduleChange(day.dow, 'is_active', e.target.value === '1')}
                        className="form-select"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                      >
                        <option value="1">Active</option>
                        <option value="0">Closed</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={sched.start_time || '09:00'}
                        onChange={(e) => handleScheduleChange(day.dow, 'start_time', e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={sched.end_time || '13:00'}
                        onChange={(e) => handleScheduleChange(day.dow, 'end_time', e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={sched.break_start || ''}
                        onChange={(e) => handleScheduleChange(day.dow, 'break_start', e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={sched.break_end || ''}
                        onChange={(e) => handleScheduleChange(day.dow, 'break_end', e.target.value)}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="15"
                        max="120"
                        step="5"
                        value={sched.appointment_duration || 30}
                        onChange={(e) => handleScheduleChange(day.dow, 'appointment_duration', parseInt(e.target.value, 10))}
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '80px' }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSaveSchedule(day.dow)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Save size={13} />
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked Dates & Blocked Slots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Blocked Dates */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ban size={18} style={{ color: 'var(--color-error)' }} />
            <span>Blocked Specific Dates</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Mark doctor as unavailable for entire days (holidays, personal leave).
          </p>

          <form onSubmit={handleAddBlockedDate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              required
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: '150px' }}
            />
            <input
              type="text"
              placeholder="Reason (e.g. Leave)"
              value={newBlockedDateReason}
              onChange={(e) => setNewBlockedDateReason(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: '150px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Block Date</span>
            </button>
          </form>

          {blockedDates.length === 0 ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              No blocked dates configured.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blockedDates.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#FEF2F2',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FECACA',
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <strong>{b.date}</strong>
                    <span style={{ marginLeft: '0.5rem', color: '#7F1D1D' }}>({b.reason})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlocked('date', b.id)}
                    style={{ color: '#991B1B', padding: '0.2rem' }}
                    title="Remove block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Specific Slots */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Block Specific Time Slot</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Reserve or block single time slots on particular dates without booking an appointment.
          </p>

          <form onSubmit={handleAddBlockedSlot} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              required
              value={newSlotDate}
              onChange={(e) => setNewSlotDate(e.target.value)}
              className="form-input"
              style={{ width: '130px' }}
            />
            <input
              type="time"
              required
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="form-input"
              style={{ width: '110px' }}
            />
            <input
              type="text"
              placeholder="Reason"
              value={newSlotReason}
              onChange={(e) => setNewSlotReason(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: '120px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Block</span>
            </button>
          </form>

          {blockedSlots.length === 0 ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              No blocked individual slots.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {blockedSlots.map((bs) => (
                <div
                  key={bs.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <strong>{bs.date}</strong> at <strong>{formatTime12(bs.time)}</strong>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--color-text-muted)' }}>({bs.reason})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlocked('slot', bs.id)}
                    style={{ color: '#991B1B', padding: '0.2rem' }}
                    title="Remove block"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
