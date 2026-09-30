export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  slug: string;
  title: string;
  qualification: string;
  specialization: string;
  professional_affiliation: string;
  biography: string;
  experience: string;
  consultation_fee: string;
  photo: string;
  phone: string;
  whatsapp: string;
  active: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  category: 'Gynaecology' | 'Skin & Medical Care' | string;
  description: string;
  doctor_id: number;
  doctor_name?: string;
  icon: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  doctor_id: number;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  day_name: string;
  start_time: string; // "09:00"
  end_time: string;   // "14:00"
  break_start: string | null; // "12:00"
  break_end: string | null;   // "12:30"
  appointment_duration: number; // in minutes, e.g. 20 or 30
  is_active: number;
}

export interface BlockedDate {
  id: number;
  doctor_id: number;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface BlockedSlot {
  id: number;
  doctor_id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: number;
  reference_number: string;
  patient_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: 'Female' | 'Male' | 'Other' | string;
  doctor_id: number;
  doctor_name?: string;
  doctor_specialization?: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  reason?: string | null;
  notes?: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  published: number; // 1 or 0
  created_at: string;
}

export interface ClinicSettings {
  id: number;
  clinic_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  opening_hours: string;
  map_url: string;
  logo: string;
  consultation_fee_note: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}
