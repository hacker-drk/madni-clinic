import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Doctor,
  Service,
  Schedule,
  BlockedDate,
  BlockedSlot,
  Appointment,
  Testimonial,
  ClinicSettings,
  ContactMessage,
} from './types';

// Detect if running on Vercel Serverless or Local
const isVercel = !!process.env.VERCEL;
const storageDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const storagePath = path.join(storageDir, 'madni_store.json');

interface DatabaseSchema {
  users: User[];
  clinic_settings: ClinicSettings;
  doctors: Doctor[];
  services: Service[];
  schedules: Schedule[];
  blocked_dates: BlockedDate[];
  blocked_slots: BlockedSlot[];
  appointments: Appointment[];
  testimonials: Testimonial[];
  contact_messages: ContactMessage[];
}

function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('MadniClinic2026!', salt);

  const initialSettings: ClinicSettings = {
    id: 1,
    clinic_name: 'Madni Clinic',
    phone: '0349-5272815',
    whatsapp: '0349-5272815',
    email: 'info@madniclinic.com',
    address: 'Madni Street, Gillani Town, Near Wensum College, D.I. Khan, Khyber Pakhtunkhwa, Pakistan',
    opening_hours: 'Monday – Saturday: 09:00 AM – 08:00 PM | Sunday: Closed',
    map_url: 'https://maps.google.com/maps?q=Madni+Street+Gillani+Town+Near+Wensum+College+D.I.+Khan&t=&z=15&ie=UTF8&iwloc=&output=embed',
    logo: '/logo.svg',
    consultation_fee_note: 'Information will be updated soon.',
    currency: 'PKR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const initialDoctors: Doctor[] = [
    {
      id: 1,
      name: 'Lady Dr. Sana Bashir',
      slug: 'lady-dr-sana-bashir',
      title: 'Lady Dr.',
      qualification: 'MBBS, DOVH',
      specialization: 'Gynaecologist',
      professional_affiliation: 'Royal College of Physician (Ireland)',
      biography: "Lady Dr. Sana Bashir is a specialized Gynaecologist providing comprehensive women's healthcare and compassionate clinical consultations at Madni Clinic, D.I. Khan.",
      experience: 'Information will be updated soon.',
      consultation_fee: 'Information will be updated soon.',
      photo: '/images/dr-sana-bashir.svg',
      phone: '0349-5272815',
      whatsapp: '0349-5272815',
      active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Dr. Sharjeel',
      slug: 'dr-sharjeel',
      title: 'Dr.',
      qualification: 'Information will be updated soon.',
      specialization: 'Skin Specialist – Medical Specialist',
      professional_affiliation: 'Information will be updated soon.',
      biography: 'Dr. Sharjeel is a qualified Skin Specialist – Medical Specialist serving patients at Madni Clinic, D.I. Khan, providing professional consultations for skin conditions and specialized medical care.',
      experience: 'Information will be updated soon.',
      consultation_fee: 'Information will be updated soon.',
      photo: '/images/dr-sharjeel.svg',
      phone: '0349-5272815',
      whatsapp: '0349-5272815',
      active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const days = [
    { dow: 1, name: 'Monday' },
    { dow: 2, name: 'Tuesday' },
    { dow: 3, name: 'Wednesday' },
    { dow: 4, name: 'Thursday' },
    { dow: 5, name: 'Friday' },
    { dow: 6, name: 'Saturday' },
  ];

  const initialSchedules: Schedule[] = [];
  let sId = 1;
  days.forEach((d) => {
    initialSchedules.push({
      id: sId++,
      doctor_id: 1,
      day_of_week: d.dow,
      day_name: d.name,
      start_time: '09:00',
      end_time: '13:00',
      break_start: '11:00',
      break_end: '11:30',
      appointment_duration: 30,
      is_active: 1,
    });
  });
  days.forEach((d) => {
    initialSchedules.push({
      id: sId++,
      doctor_id: 2,
      day_of_week: d.dow,
      day_name: d.name,
      start_time: '15:00',
      end_time: '20:00',
      break_start: '17:30',
      break_end: '18:00',
      appointment_duration: 30,
      is_active: 1,
    });
  });

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

  const skinServices = [
    { name: 'Skin Consultation', slug: 'skin-consultation', desc: 'In-depth dermatological evaluation and targeted management for acute and chronic skin conditions.' },
    { name: 'Medical Consultation', slug: 'medical-consultation', desc: 'Specialist medical evaluation and diagnosis for internal and systemic health concerns.' },
    { name: 'General Health Consultation', slug: 'general-health-consultation', desc: 'Routine and focused clinical check-ups for ongoing health preservation.' },
    { name: 'Common Skin Problems', slug: 'common-skin-problems', desc: 'Clinical care for eczema, acne, dermatitis, fungal infections, and skin allergies.' },
    { name: 'General Medical Assessment', slug: 'general-medical-assessment', desc: 'Holistic clinical assessments, vitals check, and customized medical guidance.' },
  ];

  let servId = 1;
  const initialServices: Service[] = [
    ...gynServices.map((s) => ({
      id: servId++,
      name: s.name,
      slug: s.slug,
      category: 'Gynaecology',
      description: s.desc,
      doctor_id: 1,
      icon: 'HeartPulse',
      active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    ...skinServices.map((s) => ({
      id: servId++,
      name: s.name,
      slug: s.slug,
      category: 'Skin & Medical Care',
      description: s.desc,
      doctor_id: 2,
      icon: 'Sparkles',
      active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  ];

  return {
    users: [
      {
        id: 1,
        name: 'Admin Madni Clinic',
        email: 'admin@madniclinic.com',
        password_hash: hash,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    clinic_settings: initialSettings,
    doctors: initialDoctors,
    services: initialServices,
    schedules: initialSchedules,
    blocked_dates: [],
    blocked_slots: [],
    appointments: [],
    testimonials: [],
    contact_messages: [],
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(storagePath)) {
        const raw = fs.readFileSync(storagePath, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure all keys exist
        const initial = getInitialData();
        return { ...initial, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read store file, using in-memory defaults', e);
    }
    const initial = getInitialData();
    this.persist(initial);
    return initial;
  }

  public persist(customData?: DatabaseSchema) {
    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      fs.writeFileSync(storagePath, JSON.stringify(customData || this.data, null, 2), 'utf8');
    } catch (e) {
      // In read-only environments (e.g. edge), gracefully ignore filesystem write errors
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }
}

// Global Singleton in memory across warm lambdas / dev server
const globalForStore = global as unknown as { __madniStore?: Store };
const storeInstance = globalForStore.__madniStore || new Store();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.__madniStore = storeInstance;
}

export function getDb() {
  const store = storeInstance;
  const d = store.getData();

  return {
    pragma: () => {},
    exec: () => {},

    transaction: (fn: Function) => {
      return (...args: any[]) => {
        return fn(...args);
      };
    },

    prepare: (query: string) => {
      const q = query.trim();

      return {
        get: (...params: any[]) => {
          // 1. users
          if (q.includes('FROM users WHERE email = ?')) {
            const email = (params[0] || '').toLowerCase().trim();
            return d.users.find((u) => u.email.toLowerCase() === email);
          }
          if (q.includes('FROM users WHERE id = ?')) {
            return d.users.find((u) => u.id === Number(params[0]));
          }
          if (q.includes('SELECT COUNT(*) as count FROM users')) {
            return { count: d.users.length };
          }

          // 2. clinic_settings
          if (q.includes('FROM clinic_settings WHERE id = 1') || q.includes('FROM clinic_settings')) {
            return d.clinic_settings;
          }

          // 3. doctors
          if (q.includes('FROM doctors WHERE slug = ? AND active = 1')) {
            return d.doctors.find((doc) => doc.slug === params[0] && doc.active === 1);
          }
          if (q.includes('FROM doctors WHERE slug = ?')) {
            return d.doctors.find((doc) => doc.slug === params[0]);
          }
          if (q.includes('FROM doctors WHERE id = ? AND active = 1')) {
            return d.doctors.find((doc) => doc.id === Number(params[0]) && doc.active === 1);
          }
          if (q.includes('FROM doctors WHERE id = ? OR slug = ?')) {
            return d.doctors.find((doc) => doc.id === Number(params[0]) || doc.slug === params[1]);
          }
          if (q.includes('FROM doctors WHERE id = ?')) {
            return d.doctors.find((doc) => doc.id === Number(params[0]));
          }
          if (q.includes('SELECT COUNT(*) as count FROM doctors')) {
            return { count: d.doctors.length };
          }

          // 4. services
          if (q.includes('FROM services') && (q.includes('WHERE s.id = ? OR s.slug = ?') || q.includes('WHERE slug = ?') || q.includes('WHERE id = ?'))) {
            const val = params[0];
            const found = d.services.find((s) => s.id === Number(val) || s.slug === val);
            if (!found) return undefined;
            const doc = d.doctors.find((doc) => doc.id === found.doctor_id);
            return {
              ...found,
              doctor_name: doc?.name || '',
              doctor_specialization: doc?.specialization || '',
              doctor_slug: doc?.slug || '',
              doctor_qualification: doc?.qualification || '',
            };
          }
          if (q.includes('SELECT COUNT(*) as count FROM services')) {
            return { count: d.services.length };
          }

          // 5. schedules
          if (q.includes('FROM schedules WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1')) {
            return d.schedules.find((s) => s.doctor_id === Number(params[0]) && s.day_of_week === Number(params[1]) && s.is_active === 1);
          }
          if (q.includes('SELECT COUNT(*) as count FROM schedules')) {
            return { count: d.schedules.length };
          }

          // 6. blocked_dates
          if (q.includes('FROM blocked_dates WHERE doctor_id = ? AND date = ?')) {
            return d.blocked_dates.find((b) => b.doctor_id === Number(params[0]) && b.date === params[1]);
          }
          if (q.includes('FROM blocked_dates WHERE doctor_id = ?')) {
            return d.blocked_dates.find((b) => b.doctor_id === Number(params[0]));
          }

          // 7. blocked_slots
          if (q.includes('FROM blocked_slots WHERE doctor_id = ? AND date = ? AND time = ?')) {
            return d.blocked_slots.find((bs) => bs.doctor_id === Number(params[0]) && bs.date === params[1] && bs.time === params[2]);
          }

          // 8. appointments
          if (q.includes('FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?')) {
            return d.appointments.find(
              (a) =>
                a.doctor_id === Number(params[0]) &&
                a.appointment_date === params[1] &&
                a.appointment_time === params[2] &&
                a.status !== 'Cancelled'
            );
          }
          if (q.includes('FROM appointments WHERE id = ?') || q.includes('WHERE a.id = ?')) {
            const apt = d.appointments.find((a) => a.id === Number(params[0]));
            if (!apt) return undefined;
            const doc = d.doctors.find((doc) => doc.id === apt.doctor_id);
            return { ...apt, doctor_name: doc?.name || '', doctor_specialization: doc?.specialization || '' };
          }
          if (q.includes('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?')) {
            const count = d.appointments.filter((a) => a.appointment_date === params[0]).length;
            return { count };
          }
          if (q.includes("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'")) {
            return { count: d.appointments.filter((a) => a.status === 'Pending').length };
          }
          if (q.includes("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'")) {
            return { count: d.appointments.filter((a) => a.status === 'Confirmed').length };
          }
          if (q.includes("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'")) {
            return { count: d.appointments.filter((a) => a.status === 'Completed').length };
          }
          if (q.includes("SELECT COUNT(*) as count FROM appointments WHERE status = 'Cancelled'")) {
            return { count: d.appointments.filter((a) => a.status === 'Cancelled').length };
          }
          if (q.includes('SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= ?')) {
            const count = d.appointments.filter(
              (a) => a.appointment_date >= params[0] && (a.status === 'Pending' || a.status === 'Confirmed')
            ).length;
            return { count };
          }
          if (q.includes('SELECT COUNT(*) as count FROM appointments')) {
            return { count: d.appointments.length };
          }

          // 9. testimonials
          if (q.includes('FROM testimonials WHERE id = ?')) {
            return d.testimonials.find((t) => t.id === Number(params[0]));
          }

          return undefined;
        },

        all: (...params: any[]) => {
          // 1. doctors
          if (q.includes('FROM doctors WHERE active = 1')) {
            return d.doctors.filter((doc) => doc.active === 1).sort((a, b) => a.id - b.id);
          }
          if (q.includes('FROM doctors')) {
            return [...d.doctors].sort((a, b) => a.id - b.id);
          }

          // 2. services
          if (q.includes('FROM services')) {
            let res = d.services.map((s) => {
              const doc = d.doctors.find((doc) => doc.id === s.doctor_id);
              return {
                ...s,
                doctor_name: doc?.name || '',
                doctor_specialization: doc?.specialization || '',
                doctor_slug: doc?.slug || '',
                doctor_qualification: doc?.qualification || '',
              };
            });

            if (q.includes('s.active = 1')) {
              res = res.filter((s) => s.active === 1);
            }
            if (q.includes('doctor_id = ?')) {
              res = res.filter((s) => s.doctor_id === Number(params[0]));
            }
            if (q.includes('category = ?')) {
              res = res.filter((s) => s.category === params[0]);
            }
            return res.sort((a, b) => a.id - b.id);
          }

          // 3. schedules
          if (q.includes('FROM schedules')) {
            let res = d.schedules.map((s) => {
              const doc = d.doctors.find((doc) => doc.id === s.doctor_id);
              return { ...s, doctor_name: doc?.name || '' };
            });

            if (q.includes('WHERE doctor_id = ? AND is_active = 1') || q.includes('WHERE s.doctor_id = ? AND s.is_active = 1')) {
              res = res.filter((s) => s.doctor_id === Number(params[0]) && s.is_active === 1);
            } else if (q.includes('doctor_id = ?')) {
              res = res.filter((s) => s.doctor_id === Number(params[0]));
            }
            return res.sort((a, b) => a.day_of_week - b.day_of_week);
          }

          // 4. blocked_dates
          if (q.includes('FROM blocked_dates')) {
            let res = d.blocked_dates.map((b) => {
              const doc = d.doctors.find((doc) => doc.id === b.doctor_id);
              return { ...b, doctor_name: doc?.name || '' };
            });
            if (q.includes('doctor_id = ?')) {
              res = res.filter((b) => b.doctor_id === Number(params[0]));
            }
            return res.sort((a, b) => a.date.localeCompare(b.date));
          }

          // 5. blocked_slots
          if (q.includes('FROM blocked_slots')) {
            let res = d.blocked_slots.map((bs) => {
              const doc = d.doctors.find((doc) => doc.id === bs.doctor_id);
              return { ...bs, doctor_name: doc?.name || '' };
            });
            if (q.includes('WHERE doctor_id = ? AND date = ?') || q.includes('WHERE bs.doctor_id = ? AND bs.date = ?')) {
              res = res.filter((bs) => bs.doctor_id === Number(params[0]) && bs.date === params[1]);
            } else if (q.includes('doctor_id = ?')) {
              res = res.filter((bs) => bs.doctor_id === Number(params[0]));
            }
            return res.sort((a, b) => a.time.localeCompare(b.time));
          }

          // 6. appointments
          if (q.includes('FROM appointments WHERE doctor_id = ? AND appointment_date = ?')) {
            return d.appointments
              .filter((a) => a.doctor_id === Number(params[0]) && a.appointment_date === params[1] && a.status !== 'Cancelled')
              .map((a) => ({ appointment_time: a.appointment_time }));
          }

          if (q.includes('WHERE a.appointment_date = ?')) {
            return d.appointments
              .filter((a) => a.appointment_date === params[0])
              .map((a) => {
                const doc = d.doctors.find((doc) => doc.id === a.doctor_id);
                return { ...a, doctor_name: doc?.name || '', doctor_specialization: doc?.specialization || '' };
              })
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
          }

          if (q.includes('FROM appointments') && q.includes('GROUP BY phone')) {
            // Patient directory aggregation
            const map = new Map<string, any>();
            d.appointments.forEach((a) => {
              const prev = map.get(a.phone);
              if (!prev) {
                map.set(a.phone, {
                  phone: a.phone,
                  patient_name: a.patient_name,
                  email: a.email || null,
                  age: a.age || null,
                  gender: a.gender || null,
                  total_appointments: 1,
                  last_appointment_date: a.appointment_date,
                });
              } else {
                prev.total_appointments++;
                if (a.appointment_date > prev.last_appointment_date) {
                  prev.last_appointment_date = a.appointment_date;
                  prev.patient_name = a.patient_name;
                  if (a.email) prev.email = a.email;
                  if (a.age) prev.age = a.age;
                  if (a.gender) prev.gender = a.gender;
                }
              }
            });
            let list = Array.from(map.values());
            if (params[0]) {
              const s = String(params[0]).replace(/%/g, '').toLowerCase();
              list = list.filter((p) => p.patient_name.toLowerCase().includes(s) || p.phone.includes(s));
            }
            return list.sort((a, b) => b.last_appointment_date.localeCompare(a.last_appointment_date));
          }

          if (q.includes('FROM appointments')) {
            let res = d.appointments.map((a) => {
              const doc = d.doctors.find((doc) => doc.id === a.doctor_id);
              return { ...a, doctor_name: doc?.name || '', doctor_specialization: doc?.specialization || '' };
            });

            // Filter logic
            if (q.includes('a.status = ?')) {
              const statusIdx = params.findIndex((p) => ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'].includes(p));
              if (statusIdx !== -1) res = res.filter((a) => a.status === params[statusIdx]);
            }
            if (q.includes('a.doctor_id = ?')) {
              res = res.filter((a) => a.doctor_id === Number(params.find((p) => typeof p === 'number')));
            }
            if (q.includes('a.appointment_date = ?')) {
              const dateP = params.find((p) => typeof p === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p));
              if (dateP) res = res.filter((a) => a.appointment_date === dateP);
            }
            if (q.includes('patient_name LIKE')) {
              const s = String(params[params.length - 1] || '').replace(/%/g, '').toLowerCase();
              res = res.filter((a) => a.patient_name.toLowerCase().includes(s) || a.phone.includes(s) || a.reference_number.toLowerCase().includes(s));
            }

            res.sort((a, b) => {
              if (a.appointment_date !== b.appointment_date) {
                return b.appointment_date.localeCompare(a.appointment_date);
              }
              return b.appointment_time.localeCompare(a.appointment_time);
            });

            if (q.includes('LIMIT 8')) {
              return res.slice(0, 8);
            }
            return res;
          }

          // 7. testimonials
          if (q.includes('FROM testimonials WHERE published = 1')) {
            return d.testimonials.filter((t) => t.published === 1).sort((a, b) => b.created_at.localeCompare(a.created_at));
          }
          if (q.includes('FROM testimonials')) {
            return [...d.testimonials].sort((a, b) => b.created_at.localeCompare(a.created_at));
          }

          return [];
        },

        run: (...params: any[]) => {
          let lastInsertRowid = 0;
          let changes = 0;

          // 1. appointments INSERT
          if (q.startsWith('INSERT INTO appointments')) {
            const nextId = d.appointments.length > 0 ? Math.max(...d.appointments.map((a) => a.id)) + 1 : 1;
            const newApt: Appointment = {
              id: nextId,
              reference_number: params[0],
              patient_name: params[1],
              phone: params[2],
              email: params[3] || null,
              age: params[4] || null,
              gender: params[5] || null,
              doctor_id: Number(params[6]),
              appointment_date: params[7],
              appointment_time: params[8],
              reason: params[9] || null,
              notes: params[10] || null,
              status: 'Pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            d.appointments.push(newApt);
            store.persist();
            return { lastInsertRowid: nextId, changes: 1 };
          }

          // 2. appointments UPDATE
          if (q.startsWith('UPDATE appointments SET')) {
            const id = Number(params[params.length - 1]);
            const target = d.appointments.find((a) => a.id === id);
            if (target) {
              if (q.includes('status = ?')) {
                target.status = params[0];
              }
              if (q.includes('notes = ?')) {
                const nIdx = q.includes('status = ?') ? 1 : 0;
                target.notes = params[nIdx];
              }
              target.updated_at = new Date().toISOString();
              changes = 1;
              store.persist();
            }
            return { lastInsertRowid: 0, changes };
          }

          // 3. clinic_settings UPDATE
          if (q.startsWith('UPDATE clinic_settings SET')) {
            // Example allowed fields
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
            let paramIdx = 0;
            allowed.forEach((field) => {
              if (q.includes(`${field} = ?`)) {
                (d.clinic_settings as any)[field] = params[paramIdx++];
              }
            });
            d.clinic_settings.updated_at = new Date().toISOString();
            store.persist();
            return { lastInsertRowid: 1, changes: 1 };
          }

          // 4. doctors INSERT / UPDATE
          if (q.startsWith('INSERT INTO doctors')) {
            const nextId = d.doctors.length > 0 ? Math.max(...d.doctors.map((doc) => doc.id)) + 1 : 1;
            const newDoc: Doctor = {
              id: nextId,
              name: params[0],
              slug: params[1],
              title: params[2],
              qualification: params[3],
              specialization: params[4],
              professional_affiliation: params[5],
              biography: params[6],
              experience: params[7],
              consultation_fee: params[8],
              photo: params[9],
              phone: params[10],
              whatsapp: params[11],
              active: params[12] ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            d.doctors.push(newDoc);
            store.persist();
            return { lastInsertRowid: nextId, changes: 1 };
          }

          if (q.startsWith('UPDATE doctors SET')) {
            const id = Number(params[params.length - 1]);
            const target = d.doctors.find((doc) => doc.id === id);
            if (target) {
              const allowed = [
                'name',
                'slug',
                'title',
                'qualification',
                'specialization',
                'professional_affiliation',
                'biography',
                'experience',
                'consultation_fee',
                'photo',
                'phone',
                'whatsapp',
                'active',
              ];
              let pIdx = 0;
              allowed.forEach((f) => {
                if (q.includes(`${f} = ?`)) {
                  (target as any)[f] = params[pIdx++];
                }
              });
              target.updated_at = new Date().toISOString();
              changes = 1;
              store.persist();
            }
            return { lastInsertRowid: id, changes };
          }

          // 5. services INSERT / UPDATE / DELETE
          if (q.startsWith('INSERT INTO services')) {
            const nextId = d.services.length > 0 ? Math.max(...d.services.map((s) => s.id)) + 1 : 1;
            const newServ: Service = {
              id: nextId,
              name: params[0],
              slug: params[1],
              category: params[2],
              description: params[3],
              doctor_id: Number(params[4]),
              icon: params[5],
              active: params[6] ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            d.services.push(newServ);
            store.persist();
            return { lastInsertRowid: nextId, changes: 1 };
          }

          if (q.startsWith('UPDATE services SET')) {
            const id = Number(params[params.length - 1]);
            const target = d.services.find((s) => s.id === id);
            if (target) {
              const allowed = ['name', 'slug', 'category', 'description', 'doctor_id', 'icon', 'active'];
              let pIdx = 0;
              allowed.forEach((f) => {
                if (q.includes(`${f} = ?`)) {
                  (target as any)[f] = f === 'doctor_id' ? Number(params[pIdx++]) : params[pIdx++];
                }
              });
              target.updated_at = new Date().toISOString();
              changes = 1;
              store.persist();
            }
            return { lastInsertRowid: id, changes };
          }

          if (q.startsWith('DELETE FROM services WHERE id = ?')) {
            const id = Number(params[0]);
            const initLen = d.services.length;
            d.services = d.services.filter((s) => s.id !== id);
            changes = initLen - d.services.length;
            store.persist();
            return { lastInsertRowid: 0, changes };
          }

          // 6. schedules UPSERT
          if (q.startsWith('INSERT INTO schedules')) {
            const docId = Number(params[0]);
            const dow = Number(params[1]);
            let target = d.schedules.find((s) => s.doctor_id === docId && s.day_of_week === dow);
            if (target) {
              target.day_name = params[2];
              target.start_time = params[3];
              target.end_time = params[4];
              target.break_start = params[5] || null;
              target.break_end = params[6] || null;
              target.appointment_duration = Number(params[7]);
              target.is_active = params[8] ? 1 : 0;
            } else {
              const nextId = d.schedules.length > 0 ? Math.max(...d.schedules.map((s) => s.id)) + 1 : 1;
              target = {
                id: nextId,
                doctor_id: docId,
                day_of_week: dow,
                day_name: params[2],
                start_time: params[3],
                end_time: params[4],
                break_start: params[5] || null,
                break_end: params[6] || null,
                appointment_duration: Number(params[7]),
                is_active: params[8] ? 1 : 0,
              };
              d.schedules.push(target);
            }
            store.persist();
            return { lastInsertRowid: target.id, changes: 1 };
          }

          // 7. blocked_dates INSERT / DELETE
          if (q.startsWith('INSERT INTO blocked_dates')) {
            const docId = Number(params[0]);
            const date = params[1];
            const reason = params[2];
            let target = d.blocked_dates.find((b) => b.doctor_id === docId && b.date === date);
            if (target) {
              target.reason = reason;
            } else {
              const nextId = d.blocked_dates.length > 0 ? Math.max(...d.blocked_dates.map((b) => b.id)) + 1 : 1;
              target = { id: nextId, doctor_id: docId, date, reason };
              d.blocked_dates.push(target);
            }
            store.persist();
            return { lastInsertRowid: target.id, changes: 1 };
          }

          if (q.startsWith('DELETE FROM blocked_dates WHERE id = ?')) {
            const id = Number(params[0]);
            const len = d.blocked_dates.length;
            d.blocked_dates = d.blocked_dates.filter((b) => b.id !== id);
            changes = len - d.blocked_dates.length;
            store.persist();
            return { lastInsertRowid: 0, changes };
          }

          // 8. blocked_slots INSERT / DELETE
          if (q.startsWith('INSERT INTO blocked_slots')) {
            const docId = Number(params[0]);
            const date = params[1];
            const time = params[2];
            const reason = params[3];
            let target = d.blocked_slots.find((bs) => bs.doctor_id === docId && bs.date === date && bs.time === time);
            if (target) {
              target.reason = reason;
            } else {
              const nextId = d.blocked_slots.length > 0 ? Math.max(...d.blocked_slots.map((bs) => bs.id)) + 1 : 1;
              target = { id: nextId, doctor_id: docId, date, time, reason };
              d.blocked_slots.push(target);
            }
            store.persist();
            return { lastInsertRowid: target.id, changes: 1 };
          }

          if (q.startsWith('DELETE FROM blocked_slots WHERE id = ?')) {
            const id = Number(params[0]);
            const len = d.blocked_slots.length;
            d.blocked_slots = d.blocked_slots.filter((bs) => bs.id !== id);
            changes = len - d.blocked_slots.length;
            store.persist();
            return { lastInsertRowid: 0, changes };
          }

          // 9. testimonials INSERT / UPDATE / DELETE
          if (q.startsWith('INSERT INTO testimonials')) {
            const nextId = d.testimonials.length > 0 ? Math.max(...d.testimonials.map((t) => t.id)) + 1 : 1;
            const newTest: Testimonial = {
              id: nextId,
              name: params[0],
              content: params[1],
              rating: Number(params[2] || 5),
              published: params[3] ? 1 : 0,
              created_at: new Date().toISOString(),
            };
            d.testimonials.push(newTest);
            store.persist();
            return { lastInsertRowid: nextId, changes: 1 };
          }

          if (q.startsWith('UPDATE testimonials SET')) {
            const id = Number(params[params.length - 1]);
            const target = d.testimonials.find((t) => t.id === id);
            if (target) {
              if (q.includes('published = ?')) target.published = params[0] ? 1 : 0;
              if (q.includes('name = ?')) target.name = params[0];
              if (q.includes('content = ?')) target.content = params[1];
              changes = 1;
              store.persist();
            }
            return { lastInsertRowid: id, changes };
          }

          if (q.startsWith('DELETE FROM testimonials WHERE id = ?')) {
            const id = Number(params[0]);
            const len = d.testimonials.length;
            d.testimonials = d.testimonials.filter((t) => t.id !== id);
            changes = len - d.testimonials.length;
            store.persist();
            return { lastInsertRowid: 0, changes };
          }

          // 10. contact_messages INSERT
          if (q.startsWith('INSERT INTO contact_messages')) {
            const nextId = d.contact_messages.length > 0 ? Math.max(...d.contact_messages.map((c) => c.id)) + 1 : 1;
            const msg: ContactMessage = {
              id: nextId,
              name: params[0],
              phone: params[1],
              email: params[2] || null,
              message: params[3],
              status: 'new',
              created_at: new Date().toISOString(),
            };
            d.contact_messages.push(msg);
            store.persist();
            return { lastInsertRowid: nextId, changes: 1 };
          }

          return { lastInsertRowid, changes };
        },
      };
    },
  };
}
