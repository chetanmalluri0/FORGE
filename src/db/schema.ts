import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table (Customers & App users)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal ID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('CUSTOMER'), // 'CUSTOMER' | 'STAFF' | 'ADMIN'
  avatarUrl: text('avatar_url'),
  fitnessGoal: text('fitness_goal'),
  age: integer('age'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admins & Staff table
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('ADMIN'), // 'ADMIN' | 'STAFF'
  phone: text('phone'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Membership plans table
export const membershipPlans = pgTable('membership_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // 'Basic', 'Pro', 'Elite'
  slug: text('slug').notNull().unique(),
  price: integer('price').notNull(), // e.g. 1999, 2999, 4999
  duration: text('duration').notNull(), // '1 Month', etc.
  description: text('description').notNull(),
  features: text('features').notNull(), // JSON string array
  benefits: text('benefits').notNull(), // JSON string array
  popular: boolean('popular').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Memberships table
export const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  planId: integer('plan_id')
    .references(() => membershipPlans.id)
    .notNull(),
  status: text('status').notNull().default('Active'), // 'Active' | 'Pending' | 'Expired' | 'Cancelled'
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(),
  amountPaid: integer('amount_paid').notNull(),
  paymentMethod: text('payment_method').default('UPI / Razorpay').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Leads table (Free Trial & Walk-in leads)
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  age: integer('age'),
  fitnessGoal: text('fitness_goal').notNull(),
  preferredTime: text('preferred_time').notNull(),
  previousExperience: text('previous_experience').notNull(),
  status: text('status').notNull().default('New'), // 'New' | 'Contacted' | 'Trial Scheduled' | 'Converted' | 'Not Interested'
  notes: text('notes'),
  assignedStaff: text('assigned_staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trainers table
export const trainers = pgTable('trainers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  bio: text('bio').notNull(),
  specialization: text('specialization').notNull(),
  experience: text('experience').notNull(), // e.g. '8+ Years'
  certifications: text('certifications'), // comma-separated or JSON
  imageUrl: text('image_url').notNull(),
  instagram: text('instagram'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Classes table
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Strength', 'HIIT', 'CrossFit', 'Yoga', 'Mobility', 'Boxing', 'Functional Training'
  description: text('description').notNull(),
  trainerId: integer('trainer_id')
    .references(() => trainers.id)
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // '07:00 AM'
  endTime: text('end_time').notNull(), // '08:00 AM'
  capacity: integer('capacity').notNull(),
  bookedCount: integer('booked_count').default(0).notNull(),
  room: text('room').default('Main Arena').notNull(),
  intensity: text('intensity').default('High').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Class Registrations table
export const classRegistrations = pgTable('class_registrations', {
  id: serial('id').primaryKey(),
  classId: integer('class_id')
    .references(() => classes.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  status: text('status').notNull().default('Confirmed'), // 'Confirmed' | 'Cancelled' | 'Attended'
  bookedAt: timestamp('booked_at').defaultNow().notNull(),
});

// Notifications table (Email & WhatsApp logs)
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'EMAIL' | 'WHATSAPP'
  category: text('category').notNull(), // 'FREE_TRIAL' | 'MEMBERSHIP' | 'CLASS_BOOKING' | 'EXPIRY_REMINDER'
  recipient: text('recipient').notNull(),
  subject: text('subject'),
  content: text('content').notNull(),
  status: text('status').notNull().default('Sent'), // 'Sent' | 'Pending' | 'Failed'
  metadata: text('metadata'), // JSON string with payload details
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Gym Programs table
export const programs = pgTable('programs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  price: integer('price').notNull(),
  duration: text('duration').notNull(),
  description: text('description').notNull(),
  benefits: text('benefits').notNull(), // JSON string array
  trainerId: integer('trainer_id').references(() => trainers.id),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Settings table (configurable WhatsApp credentials, gym hours, contact info, analytics)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Drizzle relations
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  classRegistrations: many(classRegistrations),
}));

export const membershipPlansRelations = relations(membershipPlans, ({ many }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  plan: one(membershipPlans, {
    fields: [memberships.planId],
    references: [membershipPlans.id],
  }),
}));

export const trainersRelations = relations(trainers, ({ many }) => ({
  classes: many(classes),
  programs: many(programs),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  trainer: one(trainers, {
    fields: [classes.trainerId],
    references: [trainers.id],
  }),
  registrations: many(classRegistrations),
}));

export const classRegistrationsRelations = relations(classRegistrations, ({ one }) => ({
  class: one(classes, {
    fields: [classRegistrations.classId],
    references: [classes.id],
  }),
  user: one(users, {
    fields: [classRegistrations.userId],
    references: [users.id],
  }),
}));

export const programsRelations = relations(programs, ({ one }) => ({
  trainer: one(trainers, {
    fields: [programs.trainerId],
    references: [trainers.id],
  }),
}));
