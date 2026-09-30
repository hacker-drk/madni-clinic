const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING MADNI CLINIC END-TO-END VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Homepage
  const homeRes = await request({ host: 'localhost', port: 3000, path: '/', method: 'GET' });
  assert(homeRes.statusCode === 200, 'Homepage returns 200 OK');
  assert(homeRes.body.includes('MADNI CLINIC'), 'Homepage includes "MADNI CLINIC" branding');
  assert(homeRes.body.includes('Quality Healthcare With Compassion and Care'), 'Homepage includes correct hero headline');
  assert(homeRes.body.includes('Lady Dr. Sana Bashir'), 'Homepage lists Lady Dr. Sana Bashir');
  assert(homeRes.body.includes('Dr. Sharjeel'), 'Homepage lists Dr. Sharjeel');
  assert(homeRes.body.includes('Skin Specialist – Medical Specialist'), 'Dr. Sharjeel has verified specialization');
  assert(homeRes.body.includes('0349-5272815'), 'Homepage displays verified clinic WhatsApp/phone number');
  assert(homeRes.body.includes('Madni Street, Gillani Town'), 'Homepage displays verified clinic address');

  // 2. Doctors listing
  const docsRes = await request({ host: 'localhost', port: 3000, path: '/doctors', method: 'GET' });
  assert(docsRes.statusCode === 200, '/doctors returns 200 OK');
  assert(docsRes.body.includes('Our Medical Specialists'), 'Doctors page rendered');

  // 3. Doctor 1 Profile
  const doc1Res = await request({ host: 'localhost', port: 3000, path: '/doctors/lady-dr-sana-bashir', method: 'GET' });
  assert(doc1Res.statusCode === 200, '/doctors/lady-dr-sana-bashir returns 200 OK');
  assert(doc1Res.body.includes('MBBS, DOVH'), 'Lady Dr. Sana Bashir qualifications displayed');
  assert(doc1Res.body.includes('Royal College of Physician (Ireland)'), 'Lady Dr. Sana Bashir affiliation displayed');

  // 4. Doctor 2 Profile
  const doc2Res = await request({ host: 'localhost', port: 3000, path: '/doctors/dr-sharjeel', method: 'GET' });
  assert(doc2Res.statusCode === 200, '/doctors/dr-sharjeel returns 200 OK');
  assert(doc2Res.body.includes('Skin Specialist – Medical Specialist'), 'Dr. Sharjeel specialization displayed');
  assert(!doc2Res.body.includes('General Physician'), 'Dr. Sharjeel is not mislabeled as General Physician');

  // 5. Services listing & detail
  const servsRes = await request({ host: 'localhost', port: 3000, path: '/services', method: 'GET' });
  assert(servsRes.statusCode === 200, '/services returns 200 OK');
  assert(servsRes.body.includes('Gynaecology Services'), 'Gynaecology services category exists');
  assert(servsRes.body.includes('Skin &amp; Medical Care Services') || servsRes.body.includes('Skin & Medical Care Services'), 'Skin & Medical category exists');

  const servDetailRes = await request({ host: 'localhost', port: 3000, path: '/services/womens-health-consultation', method: 'GET' });
  assert(servDetailRes.statusCode === 200, '/services/womens-health-consultation returns 200 OK');
  assert(servDetailRes.body.includes("Women's Health Consultation"), 'Service detail rendered');

  // 6. About & Contact Pages
  const aboutRes = await request({ host: 'localhost', port: 3000, path: '/about', method: 'GET' });
  assert(aboutRes.statusCode === 200, '/about returns 200 OK');

  const contactRes = await request({ host: 'localhost', port: 3000, path: '/contact', method: 'GET' });
  assert(contactRes.statusCode === 200, '/contact returns 200 OK');

  // 7. Robots.txt and Sitemap.xml
  const robotsRes = await request({ host: 'localhost', port: 3000, path: '/robots.txt', method: 'GET' });
  assert(robotsRes.statusCode === 200, '/robots.txt returns 200 OK');
  assert(robotsRes.body.includes('Disallow: /admin/'), 'Robots protects admin paths');

  const sitemapRes = await request({ host: 'localhost', port: 3000, path: '/sitemap.xml', method: 'GET' });
  assert(sitemapRes.statusCode === 200, '/sitemap.xml returns 200 OK');
  assert(sitemapRes.body.includes('doctors/lady-dr-sana-bashir'), 'Sitemap has doctor routes');

  // 8. Available Slots API
  // Calculate next Thursday date (guaranteed working day)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  const targetDateStr = futureDate.toISOString().split('T')[0];

  const slotsRes = await request({
    host: 'localhost',
    port: 3000,
    path: `/api/slots?doctorId=1&date=${targetDateStr}`,
    method: 'GET',
  });
  assert(slotsRes.statusCode === 200, '/api/slots returns 200 OK');
  const slotsJson = JSON.parse(slotsRes.body);
  assert(Array.isArray(slotsJson.slots), 'Slots API returns slots array');
  const availableSlot = slotsJson.slots.find((s) => s.available);
  assert(availableSlot !== undefined, `Found available slot: ${availableSlot?.time24} (${availableSlot?.time12})`);

  // 9. Public Appointment Booking
  let bookedRef = '';
  let bookedAptId = 0;
  if (availableSlot) {
    const bookRes = await request(
      {
        host: 'localhost',
        port: 3000,
        path: '/api/appointments',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        patient_name: 'Fatima Bibi',
        phone: '0349-5272815',
        email: 'fatima@example.com',
        age: 28,
        gender: 'Female',
        doctor_id: 1,
        appointment_date: targetDateStr,
        appointment_time: availableSlot.time24,
        reason: 'Prenatal wellness checkup',
        notes: 'First visit to clinic',
      }
    );

    assert(bookRes.statusCode === 200, 'Appointment booking succeeded with 200 OK');
    const bookData = JSON.parse(bookRes.body);
    assert(bookData.success === true, 'Booking response success is true');
    assert(bookData.appointment && bookData.appointment.reference_number.startsWith('APT-'), `Reference number generated: ${bookData.appointment?.reference_number}`);
    bookedRef = bookData.appointment?.reference_number;
    bookedAptId = bookData.appointment?.id;

    // 10. DOUBLE-BOOKING PREVENTION TEST!
    console.log('Testing Double-Booking Protection for the exact same slot...');
    const duplicateRes = await request(
      {
        host: 'localhost',
        port: 3000,
        path: '/api/appointments',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        patient_name: 'Imran Khan',
        phone: '03001234567',
        doctor_id: 1,
        appointment_date: targetDateStr,
        appointment_time: availableSlot.time24,
        reason: 'Duplicate slot test',
      }
    );

    assert(duplicateRes.statusCode === 409, 'Double booking rejected with 409 Conflict');
    const dupData = JSON.parse(duplicateRes.body);
    assert(
      dupData.error === 'This appointment slot is no longer available. Please select another time.',
      `Correct double booking error message returned: "${dupData.error}"`
    );

    // Verify slot now shows as available: false
    const updatedSlotsRes = await request({
      host: 'localhost',
      port: 3000,
      path: `/api/slots?doctorId=1&date=${targetDateStr}`,
      method: 'GET',
    });
    const updatedSlotsJson = JSON.parse(updatedSlotsRes.body);
    const slotAfterBooking = updatedSlotsJson.slots.find((s) => s.time24 === availableSlot.time24);
    assert(slotAfterBooking?.available === false, 'Slot now marked unavailable in slots calculation');
  }

  // 11. Contact Form API
  const contactSubmitRes = await request(
    {
      host: 'localhost',
      port: 3000,
      path: '/api/contact',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Ahmad Farooq',
      phone: '0349-5272815',
      email: 'ahmad@example.com',
      message: 'Hello, what are the Saturday timings for Dr. Sharjeel?',
    }
  );
  assert(contactSubmitRes.statusCode === 200, 'Contact form submitted with 200 OK');
  const contactData = JSON.parse(contactSubmitRes.body);
  assert(contactData.message === 'Thank you. Your message has been received.', 'Correct contact acknowledgment message');

  // 12. Admin Authentication & API Protection
  console.log('Testing Admin Authentication & API security...');
  const unauthRes = await request({ host: 'localhost', port: 3000, path: '/api/appointments', method: 'GET' });
  assert(unauthRes.statusCode === 401, 'Unauthenticated access to /api/appointments rejected with 401');

  // Login
  const loginRes = await request(
    {
      host: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'admin@madniclinic.com',
      password: 'MadniClinic2026!',
    }
  );
  assert(loginRes.statusCode === 200, 'Admin login succeeded with 200 OK');
  const cookieHeader = loginRes.headers['set-cookie'];
  assert(cookieHeader && cookieHeader.length > 0, 'Admin session cookie returned');
  const adminCookie = cookieHeader ? cookieHeader[0].split(';')[0] : '';

  // 13. Admin Dashboard Stats
  const statsRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/appointments/stats',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  assert(statsRes.statusCode === 200, '/api/appointments/stats returns 200 OK with admin cookie');
  const statsData = JSON.parse(statsRes.body);
  assert(statsData.stats.total >= 1, `Stats count reflected in admin dashboard (Total: ${statsData.stats.total})`);

  // 14. Admin Appointments List & Status Update
  const adminAptsRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/appointments',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  assert(adminAptsRes.statusCode === 200, '/api/appointments returns 200 OK with admin cookie');
  const adminAptsData = JSON.parse(adminAptsRes.body);
  const foundApt = adminAptsData.appointments.find((a) => a.reference_number === bookedRef);
  assert(foundApt !== undefined, `Found booked appointment ${bookedRef} in admin appointments list`);

  if (bookedAptId) {
    const updateRes = await request(
      {
        host: 'localhost',
        port: 3000,
        path: `/api/appointments/${bookedAptId}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      },
      { status: 'Confirmed' }
    );
    assert(updateRes.statusCode === 200, 'Admin status update to "Confirmed" succeeded');
    const updateData = JSON.parse(updateRes.body);
    assert(updateData.appointment.status === 'Confirmed', 'Status verified as "Confirmed" in database');
  }

  // 15. Admin Patient Directory
  const patientsRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/patients',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  assert(patientsRes.statusCode === 200, '/api/patients returns 200 OK with admin cookie');
  const patientsData = JSON.parse(patientsRes.body);
  const patientRecord = patientsData.patients.find((p) => p.phone === '03495272815');
  assert(patientRecord !== undefined, `Patient Fatima Bibi found in secure patient directory`);

  // 16. Admin Settings Check
  const settingsRes = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/settings',
    method: 'GET',
  });
  assert(settingsRes.statusCode === 200, '/api/settings returns 200 OK');
  const settingsData = JSON.parse(settingsRes.body);
  assert(settingsData.settings.clinic_name === 'Madni Clinic', 'Clinic name verified in settings');
  assert(settingsData.settings.whatsapp === '0349-5272815', 'Clinic WhatsApp verified in settings');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
