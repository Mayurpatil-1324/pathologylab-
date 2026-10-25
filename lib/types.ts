export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'LAB_MANAGER'
  | 'RECEPTIONIST'
  | 'PHLEBOTOMIST'
  | 'REPORT_MANAGER'
  | 'PATIENT';

export type BookingStatusType =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'COLLECTION_ASSIGNED'
  | 'SAMPLE_COLLECTED'
  | 'SAMPLE_RECEIVED'
  | 'PROCESSING'
  | 'REPORT_READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatusType =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type CollectionType = 'HOME_COLLECTION' | 'CENTER_VISIT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
}

export interface CartItem {
  id: string;
  itemType: 'TEST' | 'PACKAGE';
  testId?: string;
  packageId?: string;
  name: string;
  slug: string;
  code?: string;
  price: number;
  mrpPrice: number;
  sampleType?: string;
  fastingRequired?: boolean;
  fastingHours?: number;
  parametersCount?: number;
}

export interface CouponInfo {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  description: string;
}

export interface TestWithCategory {
  id: string;
  testCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  overview: string;
  clinicalPurpose: string;
  sampleType: string;
  fastingRequired: boolean;
  fastingHours: number;
  preparation: string;
  reportTurnaroundHours: number;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  isPopular: boolean;
  isHomeCollectionAvailable: boolean;
  isCenterVisitAvailable: boolean;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    iconName: string;
  };
  parameters?: {
    id: string;
    name: string;
    referenceRange: string | null;
    unit: string | null;
    description: string | null;
    displayOrder: number;
  }[];
}

export interface HealthPackageWithTests {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  overview: string;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  fastingRequired: boolean;
  fastingHours: number;
  reportTurnaroundHours: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tests: {
    test: TestWithCategory;
  }[];
}
