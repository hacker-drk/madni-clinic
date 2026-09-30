import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, doctor_id, date, time, reason } = body;
    const db = getDb();

    if (type === 'date') {
      if (!doctor_id || !date) {
        return NextResponse.json({ error: 'Doctor and Date are required.' }, { status: 400 });
      }

      db.prepare(`
        INSERT INTO blocked_dates (doctor_id, date, reason)
        VALUES (?, ?, ?)
        ON CONFLICT(doctor_id, date) DO UPDATE SET reason = excluded.reason
      `).run(parseInt(doctor_id, 10), date, reason || 'Doctor unavailable');

      return NextResponse.json({ success: true, message: 'Date blocked successfully.' });
    }

    if (type === 'slot') {
      if (!doctor_id || !date || !time) {
        return NextResponse.json({ error: 'Doctor, Date, and Time are required.' }, { status: 400 });
      }

      db.prepare(`
        INSERT INTO blocked_slots (doctor_id, date, time, reason)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(doctor_id, date, time) DO UPDATE SET reason = excluded.reason
      `).run(parseInt(doctor_id, 10), date, time, reason || 'Slot reserved');

      return NextResponse.json({ success: true, message: 'Time slot blocked successfully.' });
    }

    return NextResponse.json({ error: 'Invalid type (expected date or slot).' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
    }

    const db = getDb();
    if (type === 'date') {
      db.prepare('DELETE FROM blocked_dates WHERE id = ?').run(id);
    } else if (type === 'slot') {
      db.prepare('DELETE FROM blocked_slots WHERE id = ?').run(id);
    }

    return NextResponse.json({ success: true, message: 'Unblocked successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
