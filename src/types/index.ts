export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type LeadStatus = 'New' | 'Contacted' | 'Trial Scheduled' | 'Converted' | 'Not Interested';

export type MembershipStatus = 'Active' | 'Pending' | 'Expired' | 'Cancelled';

export interface User {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  fitnessGoal?: string | null;
  age?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  phone?: string | null;
  lastLoginAt?: string | null;
}

export interface MembershipPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  duration: string;
  description: string;
  features: string[]; // parsed from JSON
  benefits: string[]; // parsed from JSON
  popular: boolean;
  createdAt: string;
}

export interface Membership {
  id: number;
  userId: number;
  planId: number;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  plan?: MembershipPlan;
  user?: User;
}

export interface Trainer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  bio: string;
  specialization: string;
  experience: string;
  certifications?: string | null;
  imageUrl: string;
  instagram?: string | null;
  active: boolean;
  createdAt: string;
}

export interface GymClass {
  id: number;
  title: string;
  category: 'Strength' | 'HIIT' | 'CrossFit' | 'Yoga' | 'Mobility' | 'Boxing' | 'Functional Training';
  description: string;
  trainerId: number;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  room: string;
  intensity: string;
  createdAt: string;
  trainer?: Trainer;
  isRegistered?: boolean;
}

export interface ClassRegistration {
  id: number;
  classId: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  status: 'Confirmed' | 'Cancelled' | 'Attended';
  bookedAt: string;
  classDetails?: GymClass;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  age?: number | null;
  fitnessGoal: string;
  preferredTime: string;
  previousExperience: string;
  status: LeadStatus;
  notes?: string | null;
  assignedStaff?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: number;
  type: 'EMAIL' | 'WHATSAPP';
  category: 'FREE_TRIAL' | 'MEMBERSHIP' | 'CLASS_BOOKING' | 'EXPIRY_REMINDER';
  recipient: string;
  subject?: string | null;
  content: string;
  status: 'Sent' | 'Pending' | 'Failed';
  metadata?: string | null;
  createdAt: string;
}

export interface GymProgram {
  id: number;
  title: string;
  price: number;
  duration: string;
  description: string;
  benefits: string[];
  trainerId?: number | null;
  imageUrl: string;
  trainer?: Trainer;
}

export interface SettingItem {
  id: number;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

export interface AdminMetrics {
  totalMembers: number;
  activeMembers: number;
  newLeads: number;
  todaysClasses: number;
  monthlyRevenue: number;
  upcomingRenewals: number;
}
