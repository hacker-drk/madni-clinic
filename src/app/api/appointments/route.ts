import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createAppointment } from '@/lib/booking-service';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patient_name,
      phone,
      email,
      age,
      gender,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      notes,
    } = body;

    // Validate required fields
    if (!patient_name || !phone || !doctor_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (Name, Phone, Doctor, Date, Time).' },
        { status: 400 }
      );
    }

    const doctorIdNum = parseInt(doctor_id, 10);
    const ageNum = age ? parseInt(age, 10) : undefined;

    const result = createAppointment({
      patient_name,
      phone,
      email,
      age: ageNum,
      gender,
      doctor_id: doctorIdNum,
      appointment_date,
      appointment_time,
      reason,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your appointment request has been received.',
      appointment: result.appointment,
    });
  } catch (error: any) {
    console.error('Error in appointment POST:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact Madni Clinic.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin check
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let query = `
      SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (doctorId && doctorId !== 'all') {
      query += ' AND a.doctor_id = ?';
      params.push(parseInt(doctorId, 10));
    }

    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (a.patient_name LIKE ? OR a.phone LIKE ? OR a.reference_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const appointments = db.prepare(query).all(...params);

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
