import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAuthenticatedAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
