export interface TimeSlot {
  time24: string; // "09:00"
  time12: string; // "09:00 AM"
  available: boolean;
  reason?: string;
}

// Format 24h "HH:MM" to 12h "hh:mm AM/PM"
export function formatTime12(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  const formattedH = h < 10 ? `0${h}` : `${h}`;
  return `${formattedH}:${m} ${ampm}`;
}

export function validatePakistaniPhone(phone: string): boolean {
  if (!phone) return false;
  // Clean phone string
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  // Matches: 03001234567 (11 digits), +923001234567 (13 chars), 923001234567 (12 digits)
  const regex = /^((\+92)|(92)|0)?3[0-9]{9}$/;
  return regex.test(clean);
}

export function formatPakistaniPhone(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+92')) {
    return '0' + clean.slice(3);
  }
  if (clean.startsWith('92')) {
    return '0' + clean.slice(2);
  }
  return clean;
}
