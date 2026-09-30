import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const appointment = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
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
    const { status, notes } = body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();

    let query = 'UPDATE appointments SET updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [];

    if (status) {
      query += ', status = ?';
      values.push(status);
    }
    if (notes !== undefined) {
      query += ', notes = ?';
      values.push(notes);
    }

    query += ' WHERE id = ?';
    values.push(id);

    const result = db.prepare(query).run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updated = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(id);

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
