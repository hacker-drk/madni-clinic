import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        phone,
        MAX(patient_name) as patient_name,
        MAX(email) as email,
        MAX(age) as age,
        MAX(gender) as gender,
        COUNT(id) as total_appointments,
        MAX(appointment_date) as last_appointment_date
      FROM appointments
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ' AND (patient_name LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    sql += ' GROUP BY phone ORDER BY last_appointment_date DESC';

    const patients = db.prepare(sql).all(...params);
    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ error: 'Patient phone number is required.' }, { status: 400 });
    }

    const db = getDb();
    const res = db.prepare('DELETE FROM appointments WHERE phone = ?').run(phone);

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: `Deleted ${res.changes} appointment(s) for patient.` });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

