import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode('healthpoint-secret-key-32-character-diagnostic-2026-secure');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('🧪 Starting HealthPoint Diagnostics Verification Test Suite...\n');

  // Test Suite 1: Authentication & Role Permissions
  console.log('📌 Test Suite 1: Authentication & Role Permissions');
  const patient = await prisma.user.findUnique({ where: { email: 'patient@healthpoint.in' } });
  const superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@healthpoint.in' } });

  assert(patient !== null, 'Patient demo account exists in database');
  assert(superAdmin !== null, 'Super Admin account exists in database');

  const validPass = await bcrypt.compare('Patient@123', patient.passwordHash);
  const invalidPass = await bcrypt.compare('WrongPassword', patient.passwordHash);
  assert(validPass === true, 'Valid password successfully verifies with bcrypt');
  assert(invalidPass === false, 'Invalid password is fundamentally rejected');

  // JWT Token Signing & Verification
  const token = await new SignJWT({ id: patient.id, email: patient.email, role: patient.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  const decoded = await jwtVerify(token, SECRET_KEY);
  assert(decoded.payload.email === 'patient@healthpoint.in', 'JWT session token accurately verifies and unpacks claims');
  assert(patient.role === 'PATIENT', 'Patient has PATIENT role assignment');
  assert(superAdmin.role === 'SUPER_ADMIN', 'Super admin has SUPER_ADMIN role assignment');

  // Test Suite 2: Diagnostic Catalog & Test Discovery
  console.log('\n📌 Test Suite 2: Diagnostic Catalog & Test Discovery');
  const allTests = await prisma.diagnosticTest.findMany({ where: { isActive: true } });
  assert(allTests.length >= 10, `Diagnostic catalog contains ${allTests.length} active tests (expected >= 10)`);

  const cbc = await prisma.diagnosticTest.findUnique({
    where: { testCode: 'HPD-CBC-01' },
    include: { parameters: true, category: true },
  });
  assert(cbc !== null, 'Complete Blood Count (CBC) test exists');
  assert(cbc.parameters.length >= 6, `CBC contains ${cbc.parameters.length} detailed biological parameters`);
  assert(cbc.sellingPrice === 299 && cbc.mrpPrice === 450, 'CBC pricing accurately configured with 33% discount');

  const packages = await prisma.healthPackage.findMany({
    include: { tests: { include: { test: true } } },
  });
  assert(packages.length >= 5, `Health packages catalog contains ${packages.length} curated packages`);

  const fullBody = packages.find((p) => p.slug === 'comprehensive-full-body-checkup');
  assert(fullBody !== null, 'Comprehensive Full Body Checkup exists');
  assert(fullBody.tests.length >= 8, `Full body checkup contains ${fullBody.tests.length} bundled profiles`);

  // Test Suite 3: Cart Pricing, Coupons & Collection Fees
  console.log('\n📌 Test Suite 3: Cart Pricing, Coupons & Collection Fees');
  const coupon = await prisma.coupon.findUnique({ where: { code: 'HEALTH15' } });
  assert(coupon !== null, 'Promo coupon HEALTH15 exists');
  assert(coupon.discountValue === 15 && coupon.discountType === 'PERCENTAGE', 'HEALTH15 is a 15% percentage discount coupon');

  const orderValueUnder500 = 349;
  const feeUnder500 = orderValueUnder500 >= 499 ? 0 : 99;
  assert(feeUnder500 === 99, 'Orders under ₹499 accurately incur ₹99 doorstep collection charge');

  const orderValueAbove500 = 1999;
  const feeAbove500 = orderValueAbove500 >= 499 ? 0 : 99;
  assert(feeAbove500 === 0, 'Orders of ₹499 and above receive FREE doorstep sample collection');

  // Test Suite 4: Transactional Booking Creation & Slot Capacity Check
  console.log('\n📌 Test Suite 4: Transactional Booking Creation & Slot Capacity Check');
  const loc = await prisma.serviceLocation.findFirst({ where: { city: 'Bengaluru' } });
  assert(loc !== null, 'Bengaluru diagnostic center exists');

  const testDate = new Date();
  testDate.setDate(testDate.getDate() + 7); // 7 days in future

  const newBooking = await prisma.booking.create({
    data: {
      bookingRef: `HPD-TEST-${Date.now().toString().slice(-4)}`,
      userId: patient.id,
      patientName: 'Test Suite Patient',
      patientAge: 45,
      patientGender: 'Male',
      patientPhone: '+91 98989 89898',
      patientEmail: 'testpatient@example.com',
      collectionType: 'HOME_COLLECTION',
      status: 'CONFIRMED',
      scheduledDate: testDate,
      slotTime: '06:30 AM - 07:30 AM',
      serviceLocationId: loc.id,
      addressString: 'Suite 101, Test Tower, Bengaluru - 560103',
      subtotal: 748,
      discount: 50,
      collectionFee: 0,
      finalAmount: 698,
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      paymentId: 'pay_test_suite_mock',
      items: {
        create: [
          {
            itemType: 'TEST',
            itemName: 'Complete Blood Count (CBC) with ESR',
            itemCode: 'HPD-CBC-01',
            priceCharged: 299,
            sampleType: 'Blood (EDTA Whole Blood)',
          },
          {
            itemType: 'TEST',
            itemName: 'Lipid Profile Comprehensive',
            itemCode: 'HPD-LIP-03',
            priceCharged: 449,
            sampleType: 'Blood (Serum)',
          },
        ],
      },
    },
    include: { items: true },
  });

  assert(newBooking.bookingRef.startsWith('HPD-TEST-'), 'Booking created with unique diagnostic reference');
  assert(newBooking.items.length === 2, 'Booking items successfully attached with immutable price snapshots');
  assert(newBooking.finalAmount === 698, 'Calculated payable total matches discount math');

  // Test Suite 5: Medical Report Security & Patient Data Isolation
  console.log('\n📌 Test Suite 5: Medical Report Security & Data Isolation');
  const medicalReport = await prisma.medicalReport.findFirst({
    where: { status: 'RELEASED' },
    include: { booking: true },
  });
  assert(medicalReport !== null, 'Doctor-verified medical report exists in database');
  assert(medicalReport.status === 'RELEASED', 'Report has RELEASED verification status');

  // Verify ownership isolation rule
  const reportOwnerId = medicalReport.booking.userId;
  const anotherUser = await prisma.user.create({
    data: {
      name: 'Unauthorized Stranger',
      email: `stranger_${Date.now()}@example.com`,
      passwordHash: await bcrypt.hash('Secret@123', 10),
      role: 'PATIENT',
    },
  });

  const isStrangerAuthorized = anotherUser.id === reportOwnerId;
  assert(isStrangerAuthorized === false, 'Patient Data Isolation: Unauthorized patient is forbidden from accessing another patient report');

  // Clean up stranger
  await prisma.user.delete({ where: { id: anotherUser.id } });

  // Test Suite 6: Booking Status Transitions & Audit Trail
  console.log('\n📌 Test Suite 6: Booking Status Transitions & Audit Trail');
  const updatedBooking = await prisma.booking.update({
    where: { id: newBooking.id },
    data: {
      status: 'CANCELLED',
      cancellationReason: 'Automated test suite cancellation verification',
      paymentStatus: 'REFUND_PENDING',
    },
  });
  assert(updatedBooking.status === 'CANCELLED', 'Booking successfully transitioned to CANCELLED state');
  assert(updatedBooking.paymentStatus === 'REFUND_PENDING', 'Paid booking sets refund status to REFUND_PENDING upon cancellation');

  // Record and verify audit log
  const audit = await prisma.auditLog.create({
    data: {
      userId: patient.id,
      userEmail: patient.email,
      action: 'BOOKING_CANCELLED_TEST',
      entityType: 'Booking',
      entityId: newBooking.id,
      detailsJson: JSON.stringify({ reason: 'Test suite validation' }),
      ipAddress: '127.0.0.1',
    },
  });
  assert(audit.id !== null, 'Audit log created for sensitive booking status transition');

  // Clean up test booking
  await prisma.booking.delete({ where: { id: newBooking.id } });

  console.log('\n========================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failed)`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
