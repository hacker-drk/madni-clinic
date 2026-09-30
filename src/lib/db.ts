import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data', 'madni_clinic.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
    seedInitialData(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clinic_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clinic_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      map_url TEXT NOT NULL,
      logo TEXT NOT NULL,
      consultation_fee_note TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PKR',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      qualification TEXT NOT NULL,
      specialization TEXT NOT NULL,
      professional_affiliation TEXT NOT NULL,
      biography TEXT NOT NULL,
      experience TEXT NOT NULL,
      consultation_fee TEXT NOT NULL,
      photo TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      doctor_id INTEGER NOT NULL,
      icon TEXT NOT NULL DEFAULT 'Stethoscope',
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL, -- 0=Sun, 1=Mon, ..., 6=Sat
      day_name TEXT NOT NULL,
      start_time TEXT NOT NULL, -- "09:00"
      end_time TEXT NOT NULL,   -- "14:00"
      break_start TEXT,        -- "12:00"
      break_end TEXT,          -- "12:30"
      appointment_duration INTEGER NOT NULL DEFAULT 30, -- minutes
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE(doctor_id, day_of_week),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocked_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(doctor_id, date),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      time TEXT NOT NULL, -- HH:MM
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(doctor_id, date, time),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_number TEXT UNIQUE NOT NULL,
      patient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      age INTEGER,
      gender TEXT,
      doctor_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL, -- YYYY-MM-DD
      appointment_time TEXT NOT NULL, -- HH:MM
      reason TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled, No Show
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      published INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Performance and double-booking indexes
    CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(doctor_id, appointment_date, appointment_time, status);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments(reference_number);
    CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
    CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
  `);
}

function seedInitialData(db: Database.Database) {
  // Check if admin user exists
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('MadniClinic2026!', salt);
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
    VALUES (1, 'Admin Madni Clinic', 'admin@madniclinic.com', ?, 'admin')
  `).run(hash);

  // Clinic settings default
  db.prepare(`
    INSERT OR IGNORE INTO clinic_settings (
      id, clinic_name, phone, whatsapp, email, address, opening_hours, map_url, logo, consultation_fee_note, currency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    'Madni Clinic',
    '0349-5272815',
    '0349-5272815',
    'info@madniclinic.com',
    'Madni Street, Gillani Town, Near Wensum College, D.I. Khan, Khyber Pakhtunkhwa, Pakistan',
    'Monday – Saturday: 09:00 AM – 08:00 PM | Sunday: Closed',
    'https://maps.google.com/maps?q=Madni+Street+Gillani+Town+Near+Wensum+College+D.I.+Khan&t=&z=15&ie=UTF8&iwloc=&output=embed',
    '/logo.svg',
    'Information will be updated soon.',
    'PKR'
  );

  // Seed Doctors if not present
  const docCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
  if (docCount.count === 0) {
    const insertDoc = db.prepare(`
      INSERT OR IGNORE INTO doctors (
        id, name, slug, title, qualification, specialization, professional_affiliation, biography, experience, consultation_fee, photo, phone, whatsapp, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Doctor 1: Lady Dr. Sana Bashir
    insertDoc.run(
      1,
      'Lady Dr. Sana Bashir',
      'lady-dr-sana-bashir',
      'Lady Dr.',
      'MBBS, DOVH',
      'Gynaecologist',
      'Royal College of Physician (Ireland)',
      'Lady Dr. Sana Bashir is a specialized Gynaecologist providing comprehensive women\'s healthcare and compassionate clinical consultations at Madni Clinic, D.I. Khan.',
      'Information will be updated soon.',
      'Information will be updated soon.',
      '/images/dr-sana-bashir.svg',
      '0349-5272815',
      '0349-5272815',
      1
    );

    // Doctor 2: Dr. Sharjeel
    insertDoc.run(
      2,
      'Dr. Sharjeel',
      'dr-sharjeel',
      'Dr.',
      'Information will be updated soon.',
      'Skin Specialist – Medical Specialist',
      'Information will be updated soon.',
      'Dr. Sharjeel is a qualified Skin Specialist – Medical Specialist serving patients at Madni Clinic, D.I. Khan, providing professional consultations for skin conditions and specialized medical care.',
      'Information will be updated soon.',
      'Information will be updated soon.',
      '/images/dr-sharjeel.svg',
      '0349-5272815',
      '0349-5272815',
      1
    );
  }

  // Seed default schedules for each doctor
  const schedCount = db.prepare('SELECT COUNT(*) as count FROM schedules').get() as { count: number };
  if (schedCount.count === 0) {
    const insertSched = db.prepare(`
      INSERT INTO schedules (doctor_id, day_of_week, day_name, start_time, end_time, break_start, break_end, appointment_duration, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const days = [
      { dow: 1, name: 'Monday' },
      { dow: 2, name: 'Tuesday' },
      { dow: 3, name: 'Wednesday' },
      { dow: 4, name: 'Thursday' },
      { dow: 5, name: 'Friday' },
      { dow: 6, name: 'Saturday' },
    ];

    // Lady Dr. Sana Bashir: Mon-Sat 09:00 - 13:00, 30 min duration
    days.forEach(d => {
      insertSched.run(1, d.dow, d.name, '09:00', '13:00', '11:00', '11:30', 30, 1);
    });

    // Dr. Sharjeel: Mon-Sat 15:00 - 20:00, 30 min duration
    days.forEach(d => {
      insertSched.run(2, d.dow, d.name, '15:00', '20:00', '17:30', '18:00', 30, 1);
    });
  }

  // Seed Services
  const servCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (servCount.count === 0) {
    const insertServ = db.prepare(`
      INSERT INTO services (name, slug, category, description, doctor_id, icon, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Gynaecology Services (Lady Dr. Sana Bashir)
    const gynServices = [
      { name: "Women's Health Consultation", slug: 'womens-health-consultation', desc: 'Comprehensive consultation for general and specific female healthcare needs.' },
      { name: 'Pregnancy Consultation', slug: 'pregnancy-consultation', desc: 'Expert medical guidance, maternal health evaluations, and pregnancy wellness care.' },
      { name: 'Antenatal Care', slug: 'antenatal-care', desc: 'Routine check-ups, vital monitoring, and clinical support throughout prenatal stages.' },
      { name: 'Menstrual Health', slug: 'menstrual-health', desc: 'Diagnosis and medical management of menstrual cycle irregularities and related symptoms.' },
      { name: 'PCOS Consultation', slug: 'pcos-consultation', desc: 'Personalized evaluation and medical care planning for polycystic ovary syndrome.' },
      { name: 'Family Planning', slug: 'family-planning', desc: 'Confidential clinical guidance on family planning and reproductive health.' },
      { name: 'Menopause Consultation', slug: 'menopause-consultation', desc: 'Supportive healthcare and clinical advice for perimenopause and menopause transition.' },
      { name: "Women's General Health", slug: 'womens-general-health', desc: 'Preventative care assessments and clinical examinations for female wellness.' },
    ];

    gynServices.forEach(s => {
      insertServ.run(s.name, s.slug, 'Gynaecology', s.desc, 1, 'HeartPulse', 1);
    });

    // Skin & Medical Care Services (Dr. Sharjeel)
    const skinServices = [
      { name: 'Skin Consultation', slug: 'skin-consultation', desc: 'In-depth dermatological evaluation and targeted management for acute and chronic skin conditions.' },
      { name: 'Medical Consultation', slug: 'medical-consultation', desc: 'Specialist medical evaluation and diagnosis for internal and systemic health concerns.' },
      { name: 'General Health Consultation', slug: 'general-health-consultation', desc: 'Routine and focused clinical check-ups for ongoing health preservation.' },
      { name: 'Common Skin Problems', slug: 'common-skin-problems', desc: 'Clinical care for eczema, acne, dermatitis, fungal infections, and skin allergies.' },
      { name: 'General Medical Assessment', slug: 'general-medical-assessment', desc: 'Holistic clinical assessments, vitals check, and customized medical guidance.' },
    ];

    skinServices.forEach(s => {
      insertServ.run(s.name, s.slug, 'Skin & Medical Care', s.desc, 2, 'Sparkles', 1);
    });
  }
}
