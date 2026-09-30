import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/booking-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorIdStr = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorIdStr || !date) {
      return NextResponse.json(
        { error: 'Doctor ID and Date (YYYY-MM-DD) are required.' },
        { status: 400 }
      );
    }

    const doctorId = parseInt(doctorIdStr, 10);
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: 'Invalid Doctor ID.' }, { status: 400 });
    }

    const result = getAvailableSlots(doctorId, date);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to calculate available time slots.' },
      { status: 500 }
    );
  }
}
