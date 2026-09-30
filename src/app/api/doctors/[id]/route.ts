import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ? OR slug = ?').get(id, id);

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const allowedFields = [
      'name',
      'slug',
      'title',
      'qualification',
      'specialization',
      'professional_affiliation',
      'biography',
      'experience',
      'consultation_fee',
      'photo',
      'phone',
      'whatsapp',
      'active',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields provided to update.' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`;
    const res = db.prepare(sql).run(...values);

    if (res.changes === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const updated = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    return NextResponse.json({ success: true, doctor: updated });
  } catch (error: any) {
    console.error('Error updating doctor:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
