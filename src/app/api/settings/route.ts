import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    const allowed = [
      'clinic_name',
      'phone',
      'whatsapp',
      'email',
      'address',
      'opening_hours',
      'map_url',
      'logo',
      'consultation_fee_note',
      'currency',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const f of allowed) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE clinic_settings SET ${updates.join(', ')} WHERE id = 1`;
    db.prepare(sql).run(...values);

    const updated = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
