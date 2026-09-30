import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    let schedulesQuery = `
      SELECT s.*, d.name as doctor_name
      FROM schedules s
      JOIN doctors d ON s.doctor_id = d.id
    `;
    const params: any[] = [];

    if (doctorId) {
      schedulesQuery += ' WHERE s.doctor_id = ?';
      params.push(parseInt(doctorId, 10));
    }

    schedulesQuery += ' ORDER BY s.doctor_id ASC, s.day_of_week ASC';
    const schedules = db.prepare(schedulesQuery).all(...params);

    // Also get blocked dates and blocked slots
    let blockedDatesQuery = `
      SELECT b.*, d.name as doctor_name
      FROM blocked_dates b
      JOIN doctors d ON b.doctor_id = d.id
    `;
    const blockedParams: any[] = [];
    if (doctorId) {
      blockedDatesQuery += ' WHERE b.doctor_id = ?';
      blockedParams.push(parseInt(doctorId, 10));
    }
    blockedDatesQuery += ' ORDER BY b.date ASC';
    const blockedDates = db.prepare(blockedDatesQuery).all(...blockedParams);

    let blockedSlotsQuery = `
      SELECT bs.*, d.name as doctor_name
      FROM blocked_slots bs
      JOIN doctors d ON bs.doctor_id = d.id
    `;
    const slotParams: any[] = [];
    if (doctorId) {
      blockedSlotsQuery += ' WHERE bs.doctor_id = ?';
      slotParams.push(parseInt(doctorId, 10));
    }
    blockedSlotsQuery += ' ORDER BY bs.date ASC, bs.time ASC';
    const blockedSlots = db.prepare(blockedSlotsQuery).all(...slotParams);

    return NextResponse.json({ schedules, blockedDates, blockedSlots });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      doctor_id,
      day_of_week,
      day_name,
      start_time,
      end_time,
      break_start,
      break_end,
      appointment_duration,
      is_active,
    } = body;

    const db = getDb();

    // Upsert schedule for doctor and day_of_week
    const upsert = db.prepare(`
      INSERT INTO schedules (
        doctor_id, day_of_week, day_name, start_time, end_time,
        break_start, break_end, appointment_duration, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(doctor_id, day_of_week) DO UPDATE SET
        day_name = excluded.day_name,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        break_start = excluded.break_start,
        break_end = excluded.break_end,
        appointment_duration = excluded.appointment_duration,
        is_active = excluded.is_active
    `);

    upsert.run(
      parseInt(doctor_id, 10),
      parseInt(day_of_week, 10),
      day_name,
      start_time,
      end_time,
      break_start || null,
      break_end || null,
      parseInt(appointment_duration || 30, 10),
      is_active ? 1 : 0
    );

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Schedule updated.' });
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
