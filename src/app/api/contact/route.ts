import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validatePakistaniPhone, formatPakistaniPhone } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Please provide your name, phone number, and message.' },
        { status: 400 }
      );
    }

    if (!validatePakistaniPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid Pakistani phone number (e.g. 0349-5272815).' },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedPhone = formatPakistaniPhone(phone);

    db.prepare(`
      INSERT INTO contact_messages (name, phone, email, message, status)
      VALUES (?, ?, ?, ?, 'new')
    `).run(name.trim(), normalizedPhone, email?.trim() || null, message.trim());

    return NextResponse.json({
      success: true,
      message: 'Thank you. Your message has been received.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact Madni Clinic.' },
      { status: 500 }
    );
  }
}
