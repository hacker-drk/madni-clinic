'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Service, Doctor } from '@/lib/types';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchServices = () => {
    setLoading(true);
    fetch('/api/services?all=true')
      .then((res) => res.json())
      .then((d) => {
        setServices(d.services || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/doctors?all=true')
      .then((res) => res.json())
      .then((d) => setDoctors(d.doctors || []));
    fetchServices();
  }, []);

  const handleEdit = (s: Service) => {
    setEditingService({ ...s });
    setIsNew(false);
  };

  const handleAddNew = () => {
    setEditingService({
      name: '',
      slug: '',
      category: 'Gynaecology',
      description: '',
      doctor_id: doctors.length > 0 ? doctors[0].id : 1,
      icon: 'Stethoscope',
      active: 1,
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const url = isNew ? '/api/services' : `/api/services/${editingService.id}`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });

      if (res.ok) {
        setEditingService(null);
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (service: Service) => {
    const updated = service.active ? 0 : 1;
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updated }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: updated } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered =
    categoryFilter === 'all'
      ? services
      : services.filter((s) => s.category === categoryFilter);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Service Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Add, edit, or categorize clinical consultation services and assign doctors.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="all">All Categories</option>
            <option value="Gynaecology">Gynaecology</option>
            <option value="Skin & Medical Care">Skin &amp; Medical Care</option>
          </select>

          <button type="button" onClick={handleAddNew} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading services...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No services found for this category.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Assigned Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} style={{ opacity: s.active ? 1 : 0.65 }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>/{s.slug}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: s.category === 'Gynaecology' ? '#F0FDF4' : '#EFF6FF',
                        color: s.category === 'Gynaecology' ? '#15803D' : '#1D4ED8',
                      }}
                    >
                      {s.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{s.doctor_name}</div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggle(s)}
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.78rem',
                        color: s.active ? 'var(--color-success)' : 'var(--color-error)',
                        borderColor: s.active ? '#BBF7D0' : '#FECACA',
                      }}
                    >
                      {s.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(s)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.55rem' }}
                        title="Edit Service"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.55rem', color: 'var(--color-error)', borderColor: '#FECACA' }}
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingService && (
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
              maxWidth: '550px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                {isNew ? 'Add New Service' : `Edit ${editingService.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                style={{ padding: '0.4rem', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Service Name <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={editingService.slug || ''}
                  onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editingService.category || 'Gynaecology'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="Gynaecology">Gynaecology</option>
                    <option value="Skin & Medical Care">Skin &amp; Medical Care</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Doctor</label>
                  <select
                    value={editingService.doctor_id || (doctors[0]?.id || 1)}
                    onChange={(e) => setEditingService({ ...editingService, doctor_id: parseInt(e.target.value, 10) })}
                    className="form-select"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setEditingService(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
