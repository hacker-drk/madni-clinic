import 'server-only';
import { getDb } from './db';
import { Schedule, BlockedDate, BlockedSlot, Appointment } from './types';
import { TimeSlot, formatTime12, validatePakistaniPhone, formatPakistaniPhone } from './utils';

// Convert "HH:MM" to total minutes from midnight
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Convert minutes to "HH:MM"
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Generate unique appointment reference: APT-YYYY-XXXXXX
export function generateReferenceNumber(db = getDb()): string {
  const year = new Date().getFullYear();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
  const nextNumber = (countRow?.count || 0) + 1;
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `APT-${year}-${String(nextNumber).padStart(4, '0')}${randomSuffix}`;
}

/**
 * Computes available time slots for a given doctor on a given date (YYYY-MM-DD)
 */
export function getAvailableSlots(doctorId: number, dateStr: string): {
  isWorkingDay: boolean;
  isDateBlocked: boolean;
  blockedReason?: string;
  slots: TimeSlot[];
} {
  const db = getDb();

  // 1. Check if date is in the past
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr < todayStr) {
    return {
      isWorkingDay: false,
      isDateBlocked: true,
      blockedReason: 'Cannot book appointments for past dates.',
      slots: [],
    };
  }

  // 2. Check blocked date
  const blockedDate = db.prepare('SELECT * FROM blocked_dates WHERE doctor_id = ? AND date = ?').get(doctorId, dateStr) as
    | BlockedDate
    | undefined;

  if (blockedDate) {
    return {
      isWorkingDay: false,
      isDateBlocked: true,
      blockedReason: blockedDate.reason || 'Doctor is unavailable on this date.',
      slots: [],
    };
  }

  // 3. Determine Day of Week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // 4. Retrieve schedule
  const schedule = db.prepare('SELECT * FROM schedules WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1').get(
    doctorId,
    dayOfWeek
  ) as Schedule | undefined;

  if (!schedule) {
    return {
      isWorkingDay: false,
      isDateBlocked: false,
      blockedReason: 'Doctor has no scheduled clinic hours on this day.',
      slots: [],
    };
  }

  // 5. Retrieve existing appointments for this doctor and date (exclude Cancelled)
  const bookedAppointments = db
    .prepare("SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'")
    .all(doctorId, dateStr) as { appointment_time: string }[];

  const bookedTimes = new Set(bookedAppointments.map((a) => a.appointment_time));

  // 6. Retrieve blocked slots for this doctor and date
  const blockedSlotsRows = db
    .prepare('SELECT time, reason FROM blocked_slots WHERE doctor_id = ? AND date = ?')
    .all(doctorId, dateStr) as BlockedSlot[];

  const blockedTimesMap = new Map<string, string>();
  blockedSlotsRows.forEach((b) => blockedTimesMap.set(b.time, b.reason));

  // 7. Calculate all possible slots
  const startMins = timeToMinutes(schedule.start_time);
  const endMins = timeToMinutes(schedule.end_time);
  const duration = schedule.appointment_duration || 30;

  const breakStartMins = schedule.break_start ? timeToMinutes(schedule.break_start) : -1;
  const breakEndMins = schedule.break_end ? timeToMinutes(schedule.break_end) : -1;

  const slots: TimeSlot[] = [];

  for (let m = startMins; m + duration <= endMins; m += duration) {
    // Check if slot overlaps with break
    const slotStart = m;
    const slotEnd = m + duration;
    const isBreak =
      breakStartMins !== -1 &&
      breakEndMins !== -1 &&
      ((slotStart >= breakStartMins && slotStart < breakEndMins) ||
        (slotEnd > breakStartMins && slotEnd <= breakEndMins));

    if (isBreak) {
      continue; // Skip breaks completely
    }

    const time24 = minutesToTime(m);
    const time12 = formatTime12(time24);

    if (bookedTimes.has(time24)) {
      slots.push({
        time24,
        time12,
        available: false,
        reason: 'Already Booked',
      });
    } else if (blockedTimesMap.has(time24)) {
      slots.push({
        time24,
        time12,
        available: false,
        reason: blockedTimesMap.get(time24) || 'Slot Reserved',
      });
    } else {
      slots.push({
        time24,
        time12,
        available: true,
      });
    }
  }

  return {
    isWorkingDay: true,
    isDateBlocked: false,
    slots,
  };
}

/**
 * Creates appointment with double-booking prevention in transaction
 */
export function createAppointment(data: {
  patient_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason?: string | null;
  notes?: string | null;
}): { success: boolean; appointment?: Appointment; error?: string } {
  const db = getDb();

  // Validate phone
  if (!validatePakistaniPhone(data.phone)) {
    return { success: false, error: 'Please enter a valid phone number (e.g. 0349-5272815).' };
  }

  // Validate doctor exists and is active
  const doctor = db.prepare('SELECT id, name FROM doctors WHERE id = ? AND active = 1').get(data.doctor_id) as
    | { id: number; name: string }
    | undefined;

  if (!doctor) {
    return { success: false, error: 'Please select a valid doctor.' };
  }

  const normalizedPhone = formatPakistaniPhone(data.phone);

  const tx = db.transaction(() => {
    // 1. Verify slot is still available inside transaction
    const existing = db
      .prepare(
        "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'"
      )
      .get(data.doctor_id, data.appointment_date, data.appointment_time);

    if (existing) {
      throw new Error('This appointment slot is no longer available. Please select another time.');
    }

    // 2. Check blocked slot
    const blockedSlot = db
      .prepare('SELECT id FROM blocked_slots WHERE doctor_id = ? AND date = ? AND time = ?')
      .get(data.doctor_id, data.appointment_date, data.appointment_time);

    if (blockedSlot) {
      throw new Error('This appointment slot is no longer available. Please select another time.');
    }

    // 3. Check blocked date
    const blockedDate = db
      .prepare('SELECT id FROM blocked_dates WHERE doctor_id = ? AND date = ?')
      .get(data.doctor_id, data.appointment_date);

    if (blockedDate) {
      throw new Error('Doctor is not available on this date. Please select another date.');
    }

    // Generate ref
    const ref = generateReferenceNumber(db);

    const insertStmt = db.prepare(`
      INSERT INTO appointments (
        reference_number, patient_name, phone, email, age, gender,
        doctor_id, appointment_date, appointment_time, reason, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = insertStmt.run(
      ref,
      data.patient_name.trim(),
      normalizedPhone,
      data.email?.trim() || null,
      data.age || null,
      data.gender || null,
      data.doctor_id,
      data.appointment_date,
      data.appointment_time,
      data.reason?.trim() || null,
      data.notes?.trim() || null
    );

    const created = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid) as Appointment;

    return created;
  });

  try {
    const createdAppointment = tx();
    return { success: true, appointment: createdAppointment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not book appointment.' };
  }
}
