import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const doctorId = searchParams.get('doctorId');
    const all = searchParams.get('all') === 'true';

    let sql = `
      SELECT s.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM services s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!all) {
      sql += ' AND s.active = 1 AND d.active = 1';
    }

    if (category) {
      sql += ' AND s.category = ?';
      params.push(category);
    }

    if (doctorId) {
      sql += ' AND s.doctor_id = ?';
      params.push(parseInt(doctorId, 10));
    }

    sql += ' ORDER BY s.id ASC';

    const services = db.prepare(sql).all(...params);
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
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
    const { name, slug, category, description, doctor_id, icon, active } = body;

    if (!name || !slug || !category || !doctor_id) {
      return NextResponse.json(
        { error: 'Name, slug, category, and doctor are required.' },
        { status: 400 }
      );
    }

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO services (name, slug, category, description, doctor_id, icon, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const res = insert.run(
      name.trim(),
      slug.trim().toLowerCase(),
      category.trim(),
      description?.trim() || '',
      parseInt(doctor_id, 10),
      icon || 'Stethoscope',
      active !== undefined ? (active ? 1 : 0) : 1
    );

    const created = db.prepare(`
      SELECT s.*, d.name as doctor_name
      FROM services s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.id = ?
    `).get(res.lastInsertRowid);

    return NextResponse.json({ success: true, service: created });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
