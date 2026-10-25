import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.reportRevision.deleteMany();
  await prisma.medicalReport.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.collectionSlot.deleteMany();
  await prisma.packageTest.deleteMany();
  await prisma.healthPackage.deleteMany();
  await prisma.testParameter.deleteMany();
  await prisma.diagnosticTest.deleteMany();
  await prisma.testCategory.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.patientAddress.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.serviceLocation.deleteMany();
  await prisma.websiteContent.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const patientHash = await bcrypt.hash('Patient@123', 10);

  // 1. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@healthpoint.in',
      passwordHash,
      name: 'Dr. Rajesh Sharma',
      phone: '+91 98111 22233',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthpoint.in',
      passwordHash,
      name: 'Vikram Mehta',
      phone: '+91 98222 33344',
      role: 'ADMIN',
    },
  });

  const labManager = await prisma.user.create({
    data: {
      email: 'labmanager@healthpoint.in',
      passwordHash,
      name: 'Dr. Sunita Rao',
      phone: '+91 98333 44455',
      role: 'LAB_MANAGER',
    },
  });

  const phlebo = await prisma.user.create({
    data: {
      email: 'phlebo@healthpoint.in',
      passwordHash,
      name: 'Ramesh Kumar (Phlebotomist)',
      phone: '+91 98444 55566',
      role: 'PHLEBOTOMIST',
    },
  });

  const reportManager = await prisma.user.create({
    data: {
      email: 'reportmanager@healthpoint.in',
      passwordHash,
      name: 'Pooja Verma (Quality & Reports)',
      phone: '+91 98555 66677',
      role: 'REPORT_MANAGER',
    },
  });

  const patient = await prisma.user.create({
    data: {
      email: 'patient@healthpoint.in',
      passwordHash: patientHash,
      name: 'Amitabh Sen',
      phone: '+91 98765 12345',
      role: 'PATIENT',
      profile: {
        create: {
          dob: new Date('1985-06-15'),
          gender: 'Male',
          bloodGroup: 'B+',
          emergencyContact: '+91 98765 99999',
        },
      },
      addresses: {
        create: [
          {
            label: 'Home',
            houseNumber: 'Flat 402, Lotus Towers',
            street: 'Outer Ring Road, Bellandur',
            area: 'Bellandur',
            city: 'Bengaluru',
            pincode: '560103',
            landmark: 'Near EcoSpace Tech Park',
            isDefault: true,
          },
          {
            label: 'Parents House',
            houseNumber: 'B-12, Green Park Extension',
            street: 'Gulmohar Enclave Marg',
            area: 'Green Park',
            city: 'Delhi NCR',
            pincode: '110016',
            landmark: 'Opposite Community Hall',
            isDefault: false,
          },
        ],
      },
      familyMembers: {
        create: [
          {
            fullName: 'Ananya Sen',
            relationship: 'Spouse',
            age: 38,
            gender: 'Female',
            phone: '+91 98765 54321',
          },
          {
            fullName: 'Subhash Sen',
            relationship: 'Parent',
            age: 68,
            gender: 'Male',
            phone: '+91 98765 88888',
          },
        ],
      },
    },
  });

  console.log('✅ Created users and profiles');

  // 2. Service Locations
  const locationsData = [
    {
      name: 'Delhi NCR - Central & South',
      city: 'Delhi NCR',
      state: 'Delhi',
      pincode: '110016',
      address: 'Plot 42, Institutional Area, Hauz Khas, New Delhi',
      phone: '+91 11 4567 8900',
    },
    {
      name: 'Mumbai - Western & Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      address: 'Shop 10-12, Prime Horizon, Link Road, Andheri West, Mumbai',
      phone: '+91 22 2678 4500',
    },
    {
      name: 'Bengaluru - Tech Corridor & Central',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      address: '100 Feet Road, 12th Main, Indiranagar, Bengaluru',
      phone: '+91 80 4123 6700',
    },
    {
      name: 'Hyderabad - Cyberabad & Banjara',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      address: 'Plot 88, Mindspace Junction, Hitec City, Hyderabad',
      phone: '+91 40 6789 1200',
    },
    {
      name: 'Pune - Kothrud & Viman Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411014',
      address: 'Ground Floor, Phoenix Business Hub, Viman Nagar, Pune',
      phone: '+91 20 2789 3400',
    },
  ];

  const serviceLocations = [];
  for (const loc of locationsData) {
    const sl = await prisma.serviceLocation.create({
      data: loc,
    });
    serviceLocations.push(sl);

    // Create 6 time slots for each location
    const slots = [
      { startTime: '06:30 AM', endTime: '07:30 AM', capacity: 6, isFastingSlot: true },
      { startTime: '07:30 AM', endTime: '08:30 AM', capacity: 8, isFastingSlot: true },
      { startTime: '08:30 AM', endTime: '09:30 AM', capacity: 8, isFastingSlot: true },
      { startTime: '09:30 AM', endTime: '10:30 AM', capacity: 6, isFastingSlot: false },
      { startTime: '11:00 AM', endTime: '12:00 PM', capacity: 5, isFastingSlot: false },
      { startTime: '04:30 PM', endTime: '05:30 PM', capacity: 5, isFastingSlot: false },
    ];

    for (const slot of slots) {
      await prisma.collectionSlot.create({
        data: {
          ...slot,
          serviceLocationId: sl.id,
        },
      });
    }
  }

  console.log('✅ Created service locations and collection slots');

  // 3. Test Categories
  const categoriesData = [
    { name: 'Full Body Checkup', slug: 'full-body-checkup', iconName: 'ShieldCheck', description: 'Comprehensive diagnostic screening covering vital organs and preventive health indicators.', displayOrder: 1, isFeatured: true },
    { name: 'Blood Tests', slug: 'blood-tests', iconName: 'Droplets', description: 'Complete blood profiling, cell counts, anemia markers, and hematology investigations.', displayOrder: 2, isFeatured: true },
    { name: 'Diabetes', slug: 'diabetes', iconName: 'Activity', description: 'Blood sugar, HbA1c, fasting insulin, and diabetic nephropathy monitoring.', displayOrder: 3, isFeatured: true },
    { name: 'Thyroid', slug: 'thyroid', iconName: 'Zap', description: 'Total and Free T3, T4, TSH, and anti-TPO thyroid antibody profiles.', displayOrder: 4, isFeatured: true },
    { name: 'Liver Function', slug: 'liver-function', iconName: 'ShieldAlert', description: 'Bilirubin, SGOT, SGPT, alkaline phosphatase, and protein markers.', displayOrder: 5, isFeatured: true },
    { name: 'Kidney Function', slug: 'kidney-function', iconName: 'Filter', description: 'Creatinine, blood urea nitrogen, uric acid, and glomerular filtration indices.', displayOrder: 6, isFeatured: true },
    { name: 'Heart Health', slug: 'heart-health', iconName: 'Heart', description: 'Lipid panels, high sensitivity CRP, cardiac enzymes, and Apolipoproteins.', displayOrder: 7, isFeatured: true },
    { name: 'Women\'s Health', slug: 'womens-health', iconName: 'UserCheck', description: 'PCOS screening, hormone panels, folate, iron profile, and bone density markers.', displayOrder: 8, isFeatured: true },
    { name: 'Men\'s Health', slug: 'mens-health', iconName: 'User', description: 'PSA, testosterone, metabolic health, and male vitality panels.', displayOrder: 9, isFeatured: false },
    { name: 'Senior Citizen Packages', slug: 'senior-citizen', iconName: 'Users', description: 'Tailored geriatric assessments for joints, cardiovascular health, kidneys, and cognition.', displayOrder: 10, isFeatured: true },
    { name: 'Vitamin Profiles', slug: 'vitamin-profiles', iconName: 'Sun', description: 'Vitamin D 25-OH, Vitamin B12, serum calcium, and essential micronutrients.', displayOrder: 11, isFeatured: true },
    { name: 'Fever and Infection', slug: 'fever-infection', iconName: 'Thermometer', description: 'Dengue, Typhoid (Widal), Malaria, CBC, ESR, and culture tests for acute febrile illness.', displayOrder: 12, isFeatured: true },
    { name: 'Urine Tests', slug: 'urine-tests', iconName: 'FileText', description: 'Routine & microscopic urinalysis, urinary microalbumin, and culture sensitivity.', displayOrder: 13, isFeatured: false },
    { name: 'Hormone Tests', slug: 'hormone-tests', iconName: 'Sparkles', description: 'Cortisol, prolactin, LH, FSH, AMH, and pituitary endocrine evaluations.', displayOrder: 14, isFeatured: false },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.testCategory.create({
      data: cat,
    });
    categoryMap[cat.slug] = createdCat;
  }

  console.log('✅ Created categories');

  // 4. Diagnostic Tests with Parameters
  const testsData = [
    {
      testCode: 'HPD-CBC-01',
      name: 'Complete Blood Count (CBC) with ESR',
      slug: 'complete-blood-count-cbc',
      categorySlug: 'blood-tests',
      shortDescription: 'Measures 24+ blood parameters including hemoglobin, platelets, RBC, and WBC differential count.',
      overview: 'A Complete Blood Count (CBC) is a standard diagnostic panel that checks your overall health and detects a wide range of disorders, including anemia, infection, inflammation, and blood disorders.',
      clinicalPurpose: 'Assesses cellular components of the blood, identifies systemic infections, screens for nutritional deficiencies, and monitors treatment responses.',
      sampleType: 'Blood (EDTA Whole Blood)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'No special fasting is strictly required. Stay adequately hydrated before sample collection.',
      reportTurnaroundHours: 12,
      mrpPrice: 450,
      sellingPrice: 299,
      discountPercent: 33,
      isPopular: true,
      parameters: [
        { name: 'Hemoglobin (Hb)', referenceRange: '13.0 - 17.0', unit: 'g/dL', description: 'Oxygen carrying protein in red blood cells.' },
        { name: 'Total Leucocyte Count (WBC)', referenceRange: '4,000 - 11,000', unit: '/cumm', description: 'White blood cells that fight infections.' },
        { name: 'Platelet Count', referenceRange: '1.5 - 4.5', unit: 'Lakhs/cumm', description: 'Cells responsible for blood clotting.' },
        { name: 'RBC Count', referenceRange: '4.5 - 5.5', unit: 'million/mcL', description: 'Red blood cell count.' },
        { name: 'Packed Cell Volume (PCV)', referenceRange: '40.0 - 50.0', unit: '%', description: 'Hematocrit percentage of blood volume.' },
        { name: 'Erythrocyte Sedimentation Rate (ESR)', referenceRange: '0 - 15', unit: 'mm/1st hr', description: 'Non-specific marker of systemic inflammation.' },
      ],
    },
    {
      testCode: 'HPD-THY-02',
      name: 'Thyroid Profile Total (T3, T4, TSH)',
      slug: 'thyroid-profile-total',
      categorySlug: 'thyroid',
      shortDescription: 'Evaluates thyroid gland performance and diagnoses hyperthyroidism or hypothyroidism.',
      overview: 'The Thyroid Profile measures the levels of Triiodothyronine (T3), Thyroxine (T4), and Thyroid Stimulating Hormone (TSH) in your blood, giving a complete picture of your metabolic regulator gland.',
      clinicalPurpose: 'Screening and monitoring of thyroid disorders such as Hashimoto thyroiditis, Graves disease, unexplained weight changes, fatigue, and mood fluctuations.',
      sampleType: 'Blood (Serum)',
      fastingRequired: true,
      fastingHours: 10,
      preparation: 'Overnight fasting of 8-10 hours is recommended. Take regular thyroid medications after the sample has been drawn, as advised by your physician.',
      reportTurnaroundHours: 18,
      mrpPrice: 650,
      sellingPrice: 399,
      discountPercent: 38,
      isPopular: true,
      parameters: [
        { name: 'Total Triiodothyronine (T3)', referenceRange: '0.80 - 2.00', unit: 'ng/mL', description: 'Active thyroid hormone.' },
        { name: 'Total Thyroxine (T4)', referenceRange: '5.1 - 14.1', unit: 'ug/dL', description: 'Main circulating thyroid pro-hormone.' },
        { name: 'Thyroid Stimulating Hormone (TSH)', referenceRange: '0.27 - 4.20', unit: 'uIU/mL', description: 'Pituitary hormone driving thyroid production.' },
      ],
    },
    {
      testCode: 'HPD-LIP-03',
      name: 'Lipid Profile Comprehensive',
      slug: 'lipid-profile-comprehensive',
      categorySlug: 'heart-health',
      shortDescription: 'Measures Total Cholesterol, HDL, LDL, VLDL, and Triglycerides for cardiovascular risk evaluation.',
      overview: 'A Lipid Profile is a panel of blood tests that serves as an initial screening tool for abnormalities in lipids like cholesterol and triglycerides, identifying cardiovascular risk.',
      clinicalPurpose: 'Estimates cardiovascular and coronary artery disease risk, monitors response to statins or lipid-lowering therapies.',
      sampleType: 'Blood (Serum)',
      fastingRequired: true,
      fastingHours: 12,
      preparation: 'Strict overnight fasting of 10 to 12 hours is mandatory. Do not consume alcohol for 24 hours prior.',
      reportTurnaroundHours: 14,
      mrpPrice: 750,
      sellingPrice: 449,
      discountPercent: 40,
      isPopular: true,
      parameters: [
        { name: 'Total Cholesterol', referenceRange: '< 200', unit: 'mg/dL', description: 'Total circulating blood cholesterol.' },
        { name: 'HDL Cholesterol (Good)', referenceRange: '> 40', unit: 'mg/dL', description: 'High-density lipoprotein protects against atherosclerosis.' },
        { name: 'LDL Cholesterol (Bad)', referenceRange: '< 100', unit: 'mg/dL', description: 'Low-density lipoprotein that deposits in arterial walls.' },
        { name: 'Triglycerides', referenceRange: '< 150', unit: 'mg/dL', description: 'Stored fat energy in the bloodstream.' },
        { name: 'VLDL Cholesterol', referenceRange: '5 - 30', unit: 'mg/dL', description: 'Very low-density lipoprotein.' },
        { name: 'Total / HDL Ratio', referenceRange: '< 4.5', unit: 'Ratio', description: 'Atherogenic index.' },
      ],
    },
    {
      testCode: 'HPD-LFT-04',
      name: 'Liver Function Test (LFT)',
      slug: 'liver-function-test-lft',
      categorySlug: 'liver-function',
      shortDescription: 'Comprehensive assessment of hepatic enzymes, bilirubin levels, and liver protein synthesis.',
      overview: 'The Liver Function Test (LFT) checks how well your liver is working. It measures levels of proteins, liver enzymes, and bilirubin in your blood to detect liver damage or disease.',
      clinicalPurpose: 'Assesses hepatitis, fatty liver, jaundice, alcohol-related liver injury, and drug-induced hepatotoxicity.',
      sampleType: 'Blood (Serum)',
      fastingRequired: true,
      fastingHours: 8,
      preparation: '8-10 hours fasting recommended. Avoid heavy or oily dinners the previous night.',
      reportTurnaroundHours: 16,
      mrpPrice: 800,
      sellingPrice: 499,
      discountPercent: 37,
      isPopular: true,
      parameters: [
        { name: 'Bilirubin Total', referenceRange: '0.2 - 1.2', unit: 'mg/dL', description: 'Waste product from breakdown of red blood cells.' },
        { name: 'Bilirubin Direct', referenceRange: '0.0 - 0.3', unit: 'mg/dL', description: 'Conjugated bilirubin processed by liver.' },
        { name: 'SGOT / AST', referenceRange: '10 - 40', unit: 'U/L', description: 'Enzyme found in liver, heart, and muscle tissue.' },
        { name: 'SGPT / ALT', referenceRange: '7 - 56', unit: 'U/L', description: 'Specific enzyme marker for hepatocellular damage.' },
        { name: 'Alkaline Phosphatase (ALP)', referenceRange: '44 - 147', unit: 'U/L', description: 'Enzyme related to bile ducts and bone turnover.' },
        { name: 'Total Protein', referenceRange: '6.0 - 8.3', unit: 'g/dL', description: 'Albumin and globulin circulating in serum.' },
      ],
    },
    {
      testCode: 'HPD-KFT-05',
      name: 'Kidney Function Test (KFT / RFT)',
      slug: 'kidney-function-test-kft',
      categorySlug: 'kidney-function',
      shortDescription: 'Evaluates renal health through Creatinine, Blood Urea, Uric Acid, and Electrolytes.',
      overview: 'The Kidney Function Test checks how effectively your kidneys are filtering metabolic waste and maintaining electrolyte and fluid balance.',
      clinicalPurpose: 'Screens for chronic kidney disease, diabetic nephropathy, dehydration, hypertension-related renal damage, and gout.',
      sampleType: 'Blood (Serum)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'Fasting is not strictly required, though a morning sample is preferred. Drink plenty of water.',
      reportTurnaroundHours: 16,
      mrpPrice: 750,
      sellingPrice: 449,
      discountPercent: 40,
      isPopular: true,
      parameters: [
        { name: 'Serum Creatinine', referenceRange: '0.7 - 1.3', unit: 'mg/dL', description: 'Byproduct of muscle breakdown filtered purely by kidneys.' },
        { name: 'Blood Urea Nitrogen (BUN)', referenceRange: '7 - 20', unit: 'mg/dL', description: 'Nitrogen waste from dietary protein.' },
        { name: 'Uric Acid', referenceRange: '3.5 - 7.2', unit: 'mg/dL', description: 'Elevated levels may trigger painful gout or kidney stones.' },
        { name: 'Serum Sodium', referenceRange: '135 - 145', unit: 'mEq/L', description: 'Major extracellular electrolyte.' },
        { name: 'Serum Potassium', referenceRange: '3.5 - 5.0', unit: 'mEq/L', description: 'Critical electrolyte for cardiac and muscular rhythm.' },
      ],
    },
    {
      testCode: 'HPD-HBA-06',
      name: 'HbA1c (Glycated Hemoglobin) with eAG',
      slug: 'hba1c-glycated-hemoglobin',
      categorySlug: 'diabetes',
      shortDescription: 'Measures 3-month average blood glucose control and estimated average glucose (eAG).',
      overview: 'The HbA1c test reflects your average blood sugar level over the past two to three months by measuring glucose bound to red blood cell hemoglobin.',
      clinicalPurpose: 'Gold standard for diagnosing pre-diabetes and diabetes mellitus, as well as tracking glycemic management efficacy.',
      sampleType: 'Blood (EDTA Whole Blood)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'No fasting required. Sample can be collected at any time of day.',
      reportTurnaroundHours: 12,
      mrpPrice: 600,
      sellingPrice: 349,
      discountPercent: 42,
      isPopular: true,
      parameters: [
        { name: 'HbA1c Concentration', referenceRange: '< 5.7', unit: '%', description: 'Normal <5.7%, Pre-diabetic 5.7-6.4%, Diabetic >=6.5%.' },
        { name: 'Estimated Average Glucose (eAG)', referenceRange: '< 117', unit: 'mg/dL', description: 'Calculated mathematical average blood glucose.' },
      ],
    },
    {
      testCode: 'HPD-GLU-07',
      name: 'Fasting Blood Glucose (FBS)',
      slug: 'fasting-blood-glucose-fbs',
      categorySlug: 'diabetes',
      shortDescription: 'Measures baseline glucose levels after an overnight fast to detect impaired glucose tolerance.',
      overview: 'Fasting Blood Sugar checks baseline circulating glucose levels before meals to evaluate metabolic regulation.',
      clinicalPurpose: 'Diagnoses impaired fasting glucose, metabolic syndrome, and early-stage diabetes mellitus.',
      sampleType: 'Blood (Fluoride Plasma)',
      fastingRequired: true,
      fastingHours: 10,
      preparation: '8 to 10 hours overnight fasting is strictly required. Only plain water is allowed.',
      reportTurnaroundHours: 8,
      mrpPrice: 200,
      sellingPrice: 99,
      discountPercent: 50,
      isPopular: false,
      parameters: [
        { name: 'Fasting Blood Glucose', referenceRange: '70 - 99', unit: 'mg/dL', description: 'Fasting value: Normal 70-99 mg/dL; Impaired 100-125 mg/dL; Diabetic >=126 mg/dL.' },
      ],
    },
    {
      testCode: 'HPD-VIT-08',
      name: 'Vitamin D (25-Hydroxy Cholecalciferol)',
      slug: 'vitamin-d-25-hydroxy',
      categorySlug: 'vitamin-profiles',
      shortDescription: 'Assesses bone health, calcium absorption, and immune resistance.',
      overview: 'Vitamin D 25-OH is the primary circulating form of Vitamin D. Adequate levels are essential for bone density, neuromuscular strength, and immune defense.',
      clinicalPurpose: 'Diagnoses vitamin D deficiency, osteopenia, osteoporosis, unexplained bone aches, and chronic fatigue.',
      sampleType: 'Blood (Serum)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'No specific preparation needed. Morning collection is convenient.',
      reportTurnaroundHours: 24,
      mrpPrice: 1400,
      sellingPrice: 799,
      discountPercent: 43,
      isPopular: true,
      parameters: [
        { name: 'Vitamin D 25-OH', referenceRange: '30.0 - 100.0', unit: 'ng/mL', description: 'Deficient <20 ng/mL, Insufficient 20-29 ng/mL, Optimal 30-100 ng/mL.' },
      ],
    },
    {
      testCode: 'HPD-B12-09',
      name: 'Vitamin B12 (Cyanocobalamin)',
      slug: 'vitamin-b12-cyanocobalamin',
      categorySlug: 'vitamin-profiles',
      shortDescription: 'Measures neuro-vital vitamin essential for nerve function and red blood cell production.',
      overview: 'Vitamin B12 is essential for neurological function, DNA synthesis, and red blood cell formation. Common deficiencies occur in vegetarians and older adults.',
      clinicalPurpose: 'Screens for megaloblastic anemia, peripheral neuropathy (tingling in hands/feet), brain fog, and fatigue.',
      sampleType: 'Blood (Serum)',
      fastingRequired: true,
      fastingHours: 8,
      preparation: 'Overnight fasting of 8-10 hours is advised.',
      reportTurnaroundHours: 24,
      mrpPrice: 1200,
      sellingPrice: 699,
      discountPercent: 41,
      isPopular: true,
      parameters: [
        { name: 'Vitamin B12', referenceRange: '211 - 911', unit: 'pg/mL', description: 'Values below 200 pg/mL indicate clinical deficiency.' },
      ],
    },
    {
      testCode: 'HPD-URN-10',
      name: 'Urine Routine and Microscopic Examination',
      slug: 'urine-routine-examination',
      categorySlug: 'urine-tests',
      shortDescription: 'Physical, chemical, and microscopic analysis to detect UTIs, proteinuria, and kidney disorders.',
      overview: 'A complete urinalysis inspecting color, transparency, pH, protein, sugar, pus cells, and epithelial cells to evaluate urinary tract health.',
      clinicalPurpose: 'Diagnoses urinary tract infections (UTI), hematuria, renal stones, and systemic metabolic anomalies.',
      sampleType: 'Urine (Clean-catch Midstream)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'Collect the first morning midstream urine sample in the sterile container provided by the phlebotomist.',
      reportTurnaroundHours: 8,
      mrpPrice: 300,
      sellingPrice: 180,
      discountPercent: 40,
      isPopular: false,
      parameters: [
        { name: 'Urine Colour & Appearance', referenceRange: 'Pale Yellow, Clear', unit: 'Visual', description: 'Physical inspection.' },
        { name: 'Specific Gravity', referenceRange: '1.005 - 1.030', unit: 'Index', description: 'Concentrating capacity of the kidneys.' },
        { name: 'Pus Cells (Leukocytes)', referenceRange: '0 - 5', unit: '/hpf', description: 'High count indicates infection or inflammation.' },
        { name: 'RBCs in Urine', referenceRange: 'Nil - 2', unit: '/hpf', description: 'Presence may indicate stones or infection.' },
        { name: 'Protein / Albumin', referenceRange: 'Nil', unit: 'Dipstick', description: 'Presence indicates glomerular filtration leak.' },
      ],
    },
    {
      testCode: 'HPD-CRP-11',
      name: 'C-Reactive Protein (CRP) Quantitative',
      slug: 'c-reactive-protein-crp',
      categorySlug: 'fever-infection',
      shortDescription: 'High-precision marker for acute systemic inflammation and bacterial infection.',
      overview: 'CRP is synthesized by the liver and rapidly surges in response to inflammation, tissue injury, or bacterial infection.',
      clinicalPurpose: 'Distinguishes bacterial from viral infections, assesses flare-ups in rheumatoid diseases, and tracks post-operative recovery.',
      sampleType: 'Blood (Serum)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'No fasting needed.',
      reportTurnaroundHours: 12,
      mrpPrice: 550,
      sellingPrice: 360,
      discountPercent: 35,
      isPopular: false,
      parameters: [
        { name: 'C-Reactive Protein', referenceRange: '< 5.0', unit: 'mg/L', description: 'Values above 10 mg/L suggest acute bacterial infection or inflammatory disorder.' },
      ],
    },
    {
      testCode: 'HPD-DEN-12',
      name: 'Dengue NS1 Antigen & IgG/IgM Antibody Rapid Test',
      slug: 'dengue-ns1-antigen-antibody',
      categorySlug: 'fever-infection',
      shortDescription: 'Early detection of dengue fever virus within the first 1–5 days of febrile symptoms.',
      overview: 'Combines NS1 viral antigen detection with IgM/IgG antibody serology to provide fast, reliable confirmation of acute dengue infection.',
      clinicalPurpose: 'Urgent diagnostic confirmation in acute high-grade fever with joint pain, retro-orbital pain, and suspected thrombocytopenia.',
      sampleType: 'Blood (Serum)',
      fastingRequired: false,
      fastingHours: 0,
      preparation: 'No fasting required. Immediate sample processing prioritized.',
      reportTurnaroundHours: 8,
      mrpPrice: 1100,
      sellingPrice: 750,
      discountPercent: 31,
      isPopular: false,
      parameters: [
        { name: 'Dengue NS1 Antigen', referenceRange: 'Negative', unit: 'Result', description: 'Positive indicates early viral phase (Days 1 to 5).' },
        { name: 'Dengue IgM Antibody', referenceRange: 'Negative', unit: 'Result', description: 'Indicates primary immune response (After Day 4).' },
        { name: 'Dengue IgG Antibody', referenceRange: 'Negative', unit: 'Result', description: 'Indicates past exposure or secondary infection.' },
      ],
    },
  ];

  const createdTestsMap = {};
  for (const t of testsData) {
    const { parameters, categorySlug, ...testFields } = t;
    const cat = categoryMap[categorySlug];
    
    const createdTest = await prisma.diagnosticTest.create({
      data: {
        ...testFields,
        categoryId: cat.id,
        parameters: {
          create: parameters.map((p, idx) => ({
            name: p.name,
            referenceRange: p.referenceRange,
            unit: p.unit,
            description: p.description,
            displayOrder: idx + 1,
          })),
        },
      },
    });
    createdTestsMap[t.slug] = createdTest;
  }

  console.log('✅ Created diagnostic tests and parameters');

  // 5. Health Packages
  const packagesData = [
    {
      name: 'Comprehensive Full Body Checkup (85+ Parameters)',
      slug: 'comprehensive-full-body-checkup',
      categorySlug: 'full-body-checkup',
      shortDescription: 'Our flagship preventative health screening covering heart, liver, kidneys, blood, thyroid, diabetes, and vitamins.',
      overview: 'The Comprehensive Full Body Checkup provides a deep 360-degree evaluation of your vital organ systems. Designed by expert pathologists to identify silent health issues before symptoms emerge.',
      mrpPrice: 4999,
      sellingPrice: 1999,
      discountPercent: 60,
      fastingRequired: true,
      fastingHours: 12,
      reportTurnaroundHours: 24,
      isPopular: true,
      isFeatured: true,
      includedTestSlugs: [
        'complete-blood-count-cbc',
        'lipid-profile-comprehensive',
        'liver-function-test-lft',
        'kidney-function-test-kft',
        'thyroid-profile-total',
        'hba1c-glycated-hemoglobin',
        'fasting-blood-glucose-fbs',
        'vitamin-d-25-hydroxy',
        'vitamin-b12-cyanocobalamin',
        'urine-routine-examination',
      ],
    },
    {
      name: 'Basic Health Checkup (40+ Parameters)',
      slug: 'basic-health-checkup',
      categorySlug: 'full-body-checkup',
      shortDescription: 'Essential annual screening for young adults and professionals covering CBC, sugar, lipid, and kidneys.',
      overview: 'Ideal foundational health checkup designed for working individuals. Tests blood counts, lipid levels, fasting sugar, and baseline kidney parameters.',
      mrpPrice: 1999,
      sellingPrice: 899,
      discountPercent: 55,
      fastingRequired: true,
      fastingHours: 10,
      reportTurnaroundHours: 18,
      isPopular: true,
      isFeatured: true,
      includedTestSlugs: [
        'complete-blood-count-cbc',
        'fasting-blood-glucose-fbs',
        'lipid-profile-comprehensive',
        'kidney-function-test-kft',
      ],
    },
    {
      name: 'Senior Citizen Comprehensive Wellness Package',
      slug: 'senior-citizen-wellness-package',
      categorySlug: 'senior-citizen',
      shortDescription: 'Specialized health package tailored for seniors (60+ years) addressing joint health, heart, kidneys, and diabetes.',
      overview: 'Geriatric profile crafted to monitor chronic conditions, bone mineral metabolism, electrolyte balance, renal filtration, and cardiac risk markers in senior citizens.',
      mrpPrice: 5500,
      sellingPrice: 2299,
      discountPercent: 58,
      fastingRequired: true,
      fastingHours: 12,
      reportTurnaroundHours: 24,
      isPopular: true,
      isFeatured: true,
      includedTestSlugs: [
        'complete-blood-count-cbc',
        'lipid-profile-comprehensive',
        'liver-function-test-lft',
        'kidney-function-test-kft',
        'hba1c-glycated-hemoglobin',
        'vitamin-d-25-hydroxy',
        'vitamin-b12-cyanocobalamin',
        'urine-routine-examination',
      ],
    },
    {
      name: 'Diabetes Care & Glycemic Monitoring Package',
      slug: 'diabetes-care-package',
      categorySlug: 'diabetes',
      shortDescription: 'In-depth assessment for individuals diagnosed with diabetes or pre-diabetes, tracking microvascular risks.',
      overview: 'Covers HbA1c, Fasting Glucose, complete kidney function, lipid profile, and urine routine to identify early diabetic complications.',
      mrpPrice: 2800,
      sellingPrice: 1199,
      discountPercent: 57,
      fastingRequired: true,
      fastingHours: 10,
      reportTurnaroundHours: 18,
      isPopular: false,
      isFeatured: true,
      includedTestSlugs: [
        'hba1c-glycated-hemoglobin',
        'fasting-blood-glucose-fbs',
        'kidney-function-test-kft',
        'lipid-profile-comprehensive',
        'urine-routine-examination',
      ],
    },
    {
      name: 'Women\'s Wellness & Hormone Balance Profile',
      slug: 'womens-wellness-package',
      categorySlug: 'womens-health',
      shortDescription: 'Comprehensive screening for women addressing anemia, thyroid, vitamin deficiencies, and metabolic vitality.',
      overview: 'Tailored for women of all ages to evaluate hormonal balance, bone health, iron reserves, and metabolic wellbeing.',
      mrpPrice: 4200,
      sellingPrice: 1799,
      discountPercent: 57,
      fastingRequired: true,
      fastingHours: 10,
      reportTurnaroundHours: 24,
      isPopular: true,
      isFeatured: true,
      includedTestSlugs: [
        'complete-blood-count-cbc',
        'thyroid-profile-total',
        'vitamin-d-25-hydroxy',
        'vitamin-b12-cyanocobalamin',
        'kidney-function-test-kft',
        'fasting-blood-glucose-fbs',
      ],
    },
    {
      name: 'Cardiac Risk & Heart Vitality Assessment',
      slug: 'cardiac-risk-package',
      categorySlug: 'heart-health',
      shortDescription: 'Cardiologist-curated panel screening for atherogenic risk, systemic vascular inflammation, and lipid abnormalities.',
      overview: 'A focused diagnostic panel assessing arterial plaque risk through high-resolution lipid fractions, blood sugar, and inflammatory markers.',
      mrpPrice: 3200,
      sellingPrice: 1499,
      discountPercent: 53,
      fastingRequired: true,
      fastingHours: 12,
      reportTurnaroundHours: 20,
      isPopular: false,
      isFeatured: false,
      includedTestSlugs: [
        'lipid-profile-comprehensive',
        'c-reactive-protein-crp',
        'hba1c-glycated-hemoglobin',
        'kidney-function-test-kft',
      ],
    },
  ];

  for (const pkg of packagesData) {
    const { includedTestSlugs, categorySlug, ...pkgFields } = pkg;
    const cat = categoryMap[categorySlug];
    const createdPkg = await prisma.healthPackage.create({
      data: {
        ...pkgFields,
        categoryId: cat ? cat.id : null,
      },
    });

    for (const testSlug of includedTestSlugs) {
      const test = createdTestsMap[testSlug];
      if (test) {
        await prisma.packageTest.create({
          data: {
            packageId: createdPkg.id,
            testId: test.id,
          },
        });
      }
    }
  }

  console.log('✅ Created health packages');

  // 6. Coupons
  const coupons = [
    {
      code: 'FIRST50',
      description: 'Flat ₹50 OFF on your first booking with HealthPoint Diagnostics',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderValue: 299,
      validUntil: new Date('2028-12-31'),
    },
    {
      code: 'HEALTH15',
      description: 'Get 15% OFF on tests & health packages above ₹999 (Max ₹300)',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 999,
      maxDiscount: 300,
      validUntil: new Date('2028-12-31'),
    },
    {
      code: 'FAMILY250',
      description: 'Special ₹250 OFF on orders above ₹1999 for family checkups',
      discountType: 'FIXED',
      discountValue: 250,
      minOrderValue: 1999,
      validUntil: new Date('2028-12-31'),
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log('✅ Created promo coupons');

  // 7. Seed Bookings & Medical Reports (realistic test data)
  const locBangalore = serviceLocations.find((l) => l.city === 'Bengaluru') || serviceLocations[0];
  const locDelhi = serviceLocations.find((l) => l.city === 'Delhi NCR') || serviceLocations[0];

  // Booking 1: Completed with available Medical Report
  const booking1 = await prisma.booking.create({
    data: {
      bookingRef: 'HPD-2026-8941',
      userId: patient.id,
      patientName: 'Amitabh Sen',
      patientAge: 40,
      patientGender: 'Male',
      patientPhone: '+91 98765 12345',
      patientEmail: 'patient@healthpoint.in',
      collectionType: 'HOME_COLLECTION',
      status: 'COMPLETED',
      scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      slotTime: '07:30 AM - 08:30 AM',
      serviceLocationId: locBangalore.id,
      addressString: 'Flat 402, Lotus Towers, Outer Ring Road, Bellandur, Bengaluru - 560103',
      subtotal: 1999,
      discount: 250,
      collectionFee: 0,
      finalAmount: 1749,
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      paymentId: 'pay_rzp_mock_8941abc',
      phlebotomistId: phlebo.id,
      notes: 'Sample collected promptly by phlebotomist. Patient requested digital report via portal.',
      items: {
        create: [
          {
            itemType: 'PACKAGE',
            itemName: 'Comprehensive Full Body Checkup (85+ Parameters)',
            priceCharged: 1999,
            sampleType: 'Blood & Urine',
          },
        ],
      },
    },
  });

  // Create released Medical Report for Booking 1
  const report1 = await prisma.medicalReport.create({
    data: {
      bookingId: booking1.id,
      reportNumber: 'RPT-2026-8941',
      fileName: 'HealthPoint_Report_HPD-2026-8941.pdf',
      fileUrl: '/mock-reports/HealthPoint_Report_HPD-2026-8941.pdf',
      fileSize: 482910,
      status: 'RELEASED',
      releasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      releasedById: reportManager.id,
      remarks: 'All 85 parameters tested on automated Beckman Coulter & Roche Cobas analyzers. Clinically verified.',
    },
  });

  // Booking 2: Sample Collected, Processing in Lab
  const booking2 = await prisma.booking.create({
    data: {
      bookingRef: 'HPD-2026-9214',
      userId: patient.id,
      patientName: 'Ananya Sen',
      patientAge: 38,
      patientGender: 'Female',
      patientPhone: '+91 98765 54321',
      patientEmail: 'patient@healthpoint.in',
      collectionType: 'HOME_COLLECTION',
      status: 'PROCESSING',
      scheduledDate: new Date(),
      slotTime: '06:30 AM - 07:30 AM',
      serviceLocationId: locBangalore.id,
      addressString: 'Flat 402, Lotus Towers, Outer Ring Road, Bellandur, Bengaluru - 560103',
      subtotal: 1098,
      discount: 150,
      collectionFee: 0,
      finalAmount: 948,
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      paymentId: 'pay_rzp_mock_9214xyz',
      phlebotomistId: phlebo.id,
      notes: 'Specimens received at central lab. Barcoded and undergoing chemiluminescence assay.',
      items: {
        create: [
          {
            itemType: 'TEST',
            itemName: 'Thyroid Profile Total (T3, T4, TSH)',
            itemCode: 'HPD-THY-02',
            priceCharged: 399,
            sampleType: 'Blood (Serum)',
          },
          {
            itemType: 'TEST',
            itemName: 'Vitamin D (25-Hydroxy Cholecalciferol)',
            itemCode: 'HPD-VIT-08',
            priceCharged: 699,
            sampleType: 'Blood (Serum)',
          },
        ],
      },
    },
  });

  // Booking 3: Confirmed Upcoming Appointment
  const booking3 = await prisma.booking.create({
    data: {
      bookingRef: 'HPD-2026-9530',
      userId: patient.id,
      patientName: 'Subhash Sen',
      patientAge: 68,
      patientGender: 'Male',
      patientPhone: '+91 98765 88888',
      patientEmail: 'patient@healthpoint.in',
      collectionType: 'HOME_COLLECTION',
      status: 'CONFIRMED',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      slotTime: '08:30 AM - 09:30 AM',
      serviceLocationId: locDelhi.id,
      addressString: 'B-12, Green Park Extension, Gulmohar Enclave Marg, Green Park, Delhi NCR - 110016',
      subtotal: 2299,
      discount: 250,
      collectionFee: 0,
      finalAmount: 2049,
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      paymentId: 'pay_rzp_mock_9530abc',
      phlebotomistId: phlebo.id,
      notes: 'Fasting instructions sent to patient via SMS & WhatsApp.',
      items: {
        create: [
          {
            itemType: 'PACKAGE',
            itemName: 'Senior Citizen Comprehensive Wellness Package',
            priceCharged: 2299,
            sampleType: 'Blood & Urine',
          },
        ],
      },
    },
  });

  // Booking 4: Pending Confirmation (Pay on Collection)
  await prisma.booking.create({
    data: {
      bookingRef: 'HPD-2026-9781',
      userId: patient.id,
      patientName: 'Amitabh Sen',
      patientAge: 40,
      patientGender: 'Male',
      patientPhone: '+91 98765 12345',
      patientEmail: 'patient@healthpoint.in',
      collectionType: 'CENTER_VISIT',
      status: 'PENDING_CONFIRMATION',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      slotTime: '09:30 AM - 10:30 AM',
      serviceLocationId: locBangalore.id,
      subtotal: 349,
      discount: 0,
      collectionFee: 0,
      finalAmount: 349,
      paymentStatus: 'PENDING',
      paymentMethod: 'PAY_AT_LAB',
      notes: 'Patient opted to pay at the front desk upon lab arrival.',
      items: {
        create: [
          {
            itemType: 'TEST',
            itemName: 'HbA1c (Glycated Hemoglobin) with eAG',
            itemCode: 'HPD-HBA-06',
            priceCharged: 349,
            sampleType: 'Blood (EDTA Whole Blood)',
          },
        ],
      },
    },
  });

  console.log('✅ Created demo bookings and sample report');

  // 8. Website Content CMS
  await prisma.websiteContent.create({
    data: {
      sectionKey: 'HERO_BANNER',
      title: 'Your Health, Our Priority',
      subtitle: 'Book diagnostic tests and preventive health checkups with convenient sample collection and secure online reports.',
      contentJson: JSON.stringify({
        searchPlaceholder: 'Search for tests, packages, or health checkups (e.g. CBC, HbA1c, Thyroid, Full Body)',
        highlightBadge: 'Trusted by 50,000+ Families Across India',
        homeCollectionText: 'Home Sample Collection Available Across Top Metros',
        ctaBookText: 'Explore Lab Tests',
        ctaUploadPrescriptionText: 'Upload Prescription',
      }),
    },
  });

  await prisma.websiteContent.create({
    data: {
      sectionKey: 'TRUST_CARDS',
      title: 'Why Choose HealthPoint Diagnostics',
      subtitle: 'Commitment to medical accuracy, ethical healthcare, and patient satisfaction.',
      contentJson: JSON.stringify([
        {
          title: 'Qualified Laboratory Professionals',
          description: 'Managed by MD Pathologists, Biochemists, and certified medical laboratory technologists.',
          icon: 'GraduationCap',
        },
        {
          title: 'Convenient Home Sample Collection',
          description: 'Hygienic, cold-chain transport by trained and temperature-verified phlebotomists.',
          icon: 'Home',
        },
        {
          title: 'Secure Online Reports',
          description: 'Automated digital reporting with private, authenticated access and doctor verification.',
          icon: 'ShieldCheck',
        },
        {
          title: 'Transparent Test Pricing',
          description: 'Zero hidden collection charges, clear breakdown of parameters, and subsidized preventive packages.',
          icon: 'Tag',
        },
      ]),
    },
  });

  // 9. FAQs
  const faqs = [
    {
      question: 'Do I need to fast before giving my blood sample?',
      answer: 'Fasting requirements depend strictly on the test. Tests like Lipid Profile, Fasting Blood Glucose, and Comprehensive Full Body Checkups require 10 to 12 hours of overnight fasting (water is allowed). Tests like Complete Blood Count (CBC) and HbA1c do not require fasting.',
      category: 'Fasting',
      displayOrder: 1,
    },
    {
      question: 'How does Home Sample Collection work?',
      answer: 'After you book your slot, an experienced and certified phlebotomist visits your specified address at your selected time. They use single-use, sterile vacuum tubes, maintain temperature-controlled sample carriers, and safely deliver your samples directly to our central testing lab.',
      category: 'Home Collection',
      displayOrder: 2,
    },
    {
      question: 'When and how will I receive my medical test report?',
      answer: 'Turnaround time ranges from 8 hours for routine tests to 24 hours for advanced vitamin or endocrine profiles. As soon as the pathologist verifies your report, you will receive an SMS/Email notification with a secure link to view and download your signed PDF report directly from your HealthPoint account.',
      category: 'Reports',
      displayOrder: 3,
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes. You can reschedule or cancel your booking free of charge up to 2 hours before your scheduled collection time directly through your My Bookings dashboard or by calling our customer care desk at +91 98765 43210.',
      category: 'General',
      displayOrder: 4,
    },
    {
      question: 'What payment modes are supported?',
      answer: 'We support all major payment options including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Cash on Collection / Pay at Lab counter.',
      category: 'Payment',
      displayOrder: 5,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // 10. Testimonials
  const testimonials = [
    {
      patientName: 'Dr. Ramesh Iyer',
      location: 'Indiranagar, Bengaluru',
      rating: 5,
      reviewText: 'Outstanding precision and timely home collection. The phlebotomist arrived right at 7:00 AM as scheduled, followed strict hygiene protocols, and my digital report was verified by evening.',
      testOrPackageName: 'Comprehensive Full Body Checkup',
      isVerified: true,
      displayOrder: 1,
    },
    {
      patientName: 'Meenakshi Sundaram',
      location: 'Green Park, New Delhi',
      rating: 5,
      reviewText: 'Booking for my senior citizen parents was completely seamless. Transparent pricing without unnecessary add-ons. The dashboard interface is very clean and easy to use.',
      testOrPackageName: 'Senior Citizen Comprehensive Wellness Package',
      isVerified: true,
      displayOrder: 2,
    },
    {
      patientName: 'Kunal Deshmukh',
      location: 'Andheri West, Mumbai',
      rating: 5,
      reviewText: 'Best diagnostic experience in Mumbai! Got my HbA1c and Vitamin D reports on the same day. Downloadable PDF was well organized with clear reference ranges.',
      testOrPackageName: 'Diabetes Care Package',
      isVerified: true,
      displayOrder: 3,
    },
  ];

  for (const testom of testimonials) {
    await prisma.testimonial.create({ data: testom });
  }

  // 11. Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      userEmail: superAdmin.email,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      entityId: 'seed-01',
      detailsJson: JSON.stringify({ message: 'HealthPoint Diagnostic platform initialized with baseline catalogs and locations.' }),
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: reportManager.id,
      userEmail: reportManager.email,
      action: 'REPORT_RELEASED',
      entityType: 'MedicalReport',
      entityId: report1.id,
      detailsJson: JSON.stringify({ reportNumber: 'RPT-2026-8941', bookingRef: 'HPD-2026-8941' }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
