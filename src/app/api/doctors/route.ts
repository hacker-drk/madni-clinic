import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let doctors;
    if (all) {
      const admin = await getAuthenticatedAdmin();
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      doctors = db.prepare('SELECT * FROM doctors ORDER BY id ASC').all();
    } else {
      doctors = db.prepare('SELECT * FROM doctors WHERE active = 1 ORDER BY id ASC').all();
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      name,
      slug,
      title,
      qualification,
      specialization,
      professional_affiliation,
      biography,
      experience,
      consultation_fee,
      photo,
      phone,
      whatsapp,
      active,
    } = body;

    if (!name || !slug || !specialization) {
      return NextResponse.json({ error: 'Name, slug, and specialization are required.' }, { status: 400 });
    }

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO doctors (
        name, slug, title, qualification, specialization, professional_affiliation,
        biography, experience, consultation_fee, photo, phone, whatsapp, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      slug.trim().toLowerCase(),
      title || 'Dr.',
      qualification || 'Information will be updated soon.',
      specialization.trim(),
      professional_affiliation || 'Information will be updated soon.',
      biography || '',
      experience || 'Information will be updated soon.',
      consultation_fee || 'Information will be updated soon.',
      photo || '/images/dr-sharjeel.svg',
      phone || '0349-5272815',
      whatsapp || '0349-5272815',
      active !== undefined ? (active ? 1 : 0) : 1
    );

    const created = db.prepare('SELECT * FROM doctors WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, doctor: created });
  } catch (error: any) {
    console.error('Error adding doctor:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
