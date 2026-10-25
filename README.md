# HealthPoint Diagnostics — Pathology Laboratory & Diagnostic Booking Platform

A modern, full-stack diagnostic laboratory and pathology booking platform inspired by top healthcare marketplaces (such as Tata 1mg Labs) built for the Indian diagnostic ecosystem.

---

## 🌟 Key Features

### Patient & Public Portal
- **Header with Live Location Selector**: Select service cities across Indian metros (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune).
- **Intelligent Autocomplete Search**: Real-time suggestions as you type across diagnostic tests, health packages, and test codes (e.g. `CBC`, `HbA1c`, `Thyroid`).
- **Hero & Doctor's Prescription Upload**: Quick prescription upload workflow with prompt review status feedback.
- **Browse by Category**: 14 specialized diagnostic categories (Full Body Checkup, Blood Tests, Diabetes, Thyroid, Liver, Kidney, Heart Health, Vitamin Profiles, etc.).
- **Popular Lab Tests Carousel & Grid**: Displays specimen types, fasting guidelines, biological parameter count, turnaround hours, MRP, selling price, and discount tags.
- **Preventive Health Packages & Package Comparison**: Side-by-side comparison modal allowing patients to evaluate up to 3 health packages simultaneously across included profiles and parameters.
- **Home Sample Collection & PIN Code Coverage Validator**: Instant check of doorstep phlebotomist availability with temperature-controlled cold-chain logistics info.
- **7-Step Multi-Step Checkout Flow**:
  1. Selected tests review & coupon application (`FIRST50`, `HEALTH15`, `FAMILY250`).
  2. Patient demographics & age/gender collection.
  3. Collection mode (Doorstep Home Collection vs Diagnostic Center Walk-in).
  4. Live Date & Time Slot Scheduling with real-time capacity and overbooking prevention.
  5. Address details with landmark.
  6. Payment selection (Online Mock Razorpay / Cash on Collection / Pay at Lab Desk).
  7. Instant confirmation with unique diagnostic reference (e.g., `HPD-2026-XXXX`).
- **Patient Account & My Bookings**:
  - Live status tracking (`Confirmed`, `Phlebo Assigned`, `Sample Collected`, `Processing`, `Report Ready`, `Completed`).
  - Cancellation requests with automated refund tracking.
  - Digital Medical Report downloads.
- **Digital Pathology Reports**:
  - Doctor-signed official PDF reports with barcode, analyzer methodology, and biological reference intervals.
  - Strict patient data isolation: Unauthorized access by modifying IDs in URL is strictly forbidden.

---

### Comprehensive Administrative Operations Dashboard (`/admin`)
- **Operations Overview**: 9 live KPI cards (Total Bookings, Today's Bookings, Confirmed, Pending, Completed, Cancelled, Collected Revenue, Pending Payments, Reports Awaiting Release).
- **7-Day Trend Analytics**: Visual charts for daily booking volume and revenue collection velocity.
- **Bookings Management**: Real-time filterable bookings table by status, mode, and date. Ability to update workflow statuses, assign phlebotomists, add operational notes, and export to CSV.
- **Diagnostic Test Catalog CRUD**: Add, edit, archive tests, manage specimen types, report turnaround hours, MRP, selling price, and individual parameters.
- **Health Packages Management**: Create multi-test bundled packages, manage savings, and link individual diagnostic tests.
- **Medical Reports Release Module**: Link lab findings to patient bookings, upload PDF reports, record pathologist remarks, release reports, and maintain revision histories.
- **Patient Management**: Search registered patient accounts, view demographic coordinates, and view lifetime order histories.
- **Role-Based Staff Access Control (RBAC)**:
  - Super Admin
  - Admin
  - Lab Manager
  - Phlebotomist
  - Report Manager
  - Receptionist
- **Website Content CMS**: Edit hero headlines, marketing subtitles, and lab helpline numbers directly without code changes.
- **Security & Audit Trail Logs**: Immutable chronological audit logging for report releases, status updates, and booking operations.

---

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Database**: SQLite (local zero-dependency instant run) / PostgreSQL (production ready via Prisma)
- **ORM**: Prisma ORM v5
- **Security & Auth**: `jose` JWT cookies, `bcryptjs` password hashing, Role-based Route Protection
- **Form Handling & State**: React Context API (`CartContext`, `LocationContext`, `AuthContext`)

---

## 🔑 Demo Access Credentials (1-Click Fill on Login Page)

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@healthpoint.in` | `Admin@123` |
| **Admin** | `admin@healthpoint.in` | `Admin@123` |
| **Lab Manager** | `labmanager@healthpoint.in` | `Admin@123` |
| **Report Manager** | `reportmanager@healthpoint.in` | `Admin@123` |
| **Phlebotomist** | `phlebo@healthpoint.in` | `Admin@123` |
| **Patient Demo** | `patient@healthpoint.in` | `Patient@123` |

---

## 🚀 Setup & Local Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Synchronize the Prisma schema with SQLite:
```bash
npx prisma db push
```

### 3. Seed Realistic Indian Diagnostic Data
```bash
npm run db:seed
```

### 4. Run Automated Test Suite
```bash
node scripts/test-suite.mjs
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
