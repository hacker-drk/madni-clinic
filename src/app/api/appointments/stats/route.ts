import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const todayStr = new Date().toISOString().split('T')[0];

    // Stats
    const totalAppointments = (db.prepare('SELECT COUNT(*) as count FROM appointments').get() as any)?.count || 0;
    const todayAppointments = (db.prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?').get(todayStr) as any)?.count || 0;
    const pendingCount = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'").get() as any)?.count || 0;
    const confirmedCount = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'").get() as any)?.count || 0;
    const completedCount = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'").get() as any)?.count || 0;
    const cancelledCount = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Cancelled'").get() as any)?.count || 0;
    const upcomingCount = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= ? AND status IN ('Pending', 'Confirmed')").get(todayStr) as any)?.count || 0;

    // Recent Appointments (last 10)
    const recentAppointments = db.prepare(`
      SELECT a.*, d.name as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
      LIMIT 8
    `).all();

    // Today's appointments
    const todaysList = db.prepare(`
      SELECT a.*, d.name as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.appointment_date = ?
      ORDER BY a.appointment_time ASC
    `).all(todayStr);

    return NextResponse.json({
      stats: {
        total: totalAppointments,
        today: todayAppointments,
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        upcoming: upcomingCount,
      },
      recentAppointments,
      todaysAppointments: todaysList,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
