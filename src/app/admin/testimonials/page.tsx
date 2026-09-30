'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Testimonial } from '@/lib/types';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Star,
} from 'lucide-react';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [published, setPublished] = useState(false);

  const fetchTestimonials = () => {
    setLoading(true);
    fetch('/api/testimonials?all=true')
      .then((res) => res.json())
      .then((d) => {
        setTestimonials(d.testimonials || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, rating, published }),
      });

      if (res.ok) {
        setName('');
        setContent('');
        setPublished(false);
        setIsAdding(false);
        fetchTestimonials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublished = async (t: Testimonial) => {
    const updated = t.published ? 0 : 1;
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, published: updated }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, published: updated } : item))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Testimonial Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Manage genuine patient reviews. Testimonials only appear on the public site if explicitly published.
          </p>
        </div>
        <button type="button" onClick={() => setIsAdding(!isAdding)} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Add Genuine Feedback</span>
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Add Genuine Patient Feedback</h3>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '0.3rem' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient Initial / Name <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Fatima A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating (Stars)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  className="form-select"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback Content <span className="req">*</span></label>
              <textarea
                rows={3}
                required
                placeholder="Patient testimonial comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                id="pub-check"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="pub-check" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Publish immediately to homepage
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Feedback</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <MessageSquareQuote size={36} style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem' }}>No testimonials saved.</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Per clinic guidelines, fake reviews are prohibited. Only real patient feedback should be added here.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Feedback</th>
                <th>Rating</th>
                <th>Public Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ maxWidth: '380px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', color: '#F59E0B' }}>
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="#F59E0B" />
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(t)}
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.78rem',
                        color: t.published ? 'var(--color-success)' : 'var(--color-text-muted)',
                        borderColor: t.published ? '#BBF7D0' : '#E2E8F0',
                      }}
                    >
                      {t.published ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-error)', borderColor: '#FECACA', padding: '0.3rem 0.55rem' }}
                      title="Delete Testimonial"
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
