import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const service = db.prepare(`
      SELECT s.*, d.name as doctor_name, d.specialization as doctor_specialization, d.slug as doctor_slug, d.whatsapp as doctor_whatsapp
      FROM services s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.id = ? OR s.slug = ?
    `).get(id, id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const allowed = ['name', 'slug', 'category', 'description', 'doctor_id', 'icon', 'active'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const f of allowed) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const res = db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (res.changes === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const updated = db.prepare(`
      SELECT s.*, d.name as doctor_name
      FROM services s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.id = ?
    `).get(id);

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const res = db.prepare('DELETE FROM services WHERE id = ?').run(id);

    if (res.changes === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Service deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
