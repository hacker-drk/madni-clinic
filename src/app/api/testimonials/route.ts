import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let testimonials;
    if (all) {
      const admin = await getAuthenticatedAdmin();
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      testimonials = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    } else {
      testimonials = db.prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY created_at DESC').all();
    }

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
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
    const { name, content, rating, published } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and testimonial content are required' }, { status: 400 });
    }

    const db = getDb();
    const res = db.prepare(`
      INSERT INTO testimonials (name, content, rating, published)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), content.trim(), rating || 5, published ? 1 : 0);

    const created = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(res.lastInsertRowid);
    return NextResponse.json({ success: true, testimonial: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, content, rating, published } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const allowed = ['name', 'content', 'rating', 'published'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const f of allowed) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(f === 'published' ? (body[f] ? 1 : 0) : body[f]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
