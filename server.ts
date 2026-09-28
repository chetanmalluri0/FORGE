import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import {
  admins,
  classes,
  classRegistrations,
  leads,
  membershipPlans,
  memberships,
  notifications,
  programs,
  settings,
  trainers,
  users,
} from './src/db/schema.ts';
import { runSeed } from './src/db/seed.ts';
import {
  comparePassword,
  generateToken,
  hashPassword,
} from './src/lib/auth.ts';
import {
  notifyClassBooking,
  notifyMembershipPurchase,
  notifyNewLead,
  sendNotification,
} from './src/lib/notifications.ts';
import {
  authenticate,
  AuthRequest,
  requireAdmin,
  requireAuth,
  requireStaffOrAdmin,
} from './src/middleware/auth.ts';
import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authenticate);

// Simple in-memory rate limiter for public forms (Leads / Auth)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
function rateLimiter(limit = 30, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || entry.expiresAt < now) {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    entry.count += 1;
    next();
  };
}

// -------------------------------------------------------------
// SEO Endpoints (Robots.txt & Sitemap.xml)
// -------------------------------------------------------------
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Sitemap: ${process.env.APP_URL || 'https://forgeperformancelab.in'}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://forgeperformancelab.in';
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/#programs</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#memberships</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#schedule</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/#trainers</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/#free-trial</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>`);
});

// -------------------------------------------------------------
// Authentication Endpoints (Customer)
// -------------------------------------------------------------
app.post('/api/auth/register', rateLimiter(10), async (req, res) => {
  try {
    const { name, email, password, phone, fitnessGoal, age } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const uid = `forge_usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        phone: phone || null,
        fitnessGoal: fitnessGoal || 'General Strength & Conditioning',
        age: age ? Number(age) : null,
        role: 'CUSTOMER',
      })
      .returning();

    const token = generateToken({
      id: newUser[0].id,
      uid: newUser[0].uid,
      email: newUser[0].email,
      name: newUser[0].name,
      role: 'CUSTOMER',
    });

    res.cookie('forge_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: newUser[0].id,
        uid: newUser[0].uid,
        email: newUser[0].email,
        name: newUser[0].name,
        phone: newUser[0].phone,
        role: newUser[0].role,
        fitnessGoal: newUser[0].fitnessGoal,
      },
      token,
    });
  } catch (error: any) {
    console.error('Customer registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', rateLimiter(15), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));

    if (existing.length === 0 || !existing[0].passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await comparePassword(password, existing[0].passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: existing[0].id,
      uid: existing[0].uid,
      email: existing[0].email,
      name: existing[0].name,
      role: existing[0].role as any,
    });

    res.cookie('forge_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: existing[0].id,
        uid: existing[0].uid,
        email: existing[0].email,
        name: existing[0].name,
        phone: existing[0].phone,
        role: existing[0].role,
        fitnessGoal: existing[0].fitnessGoal,
      },
      token,
    });
  } catch (error: any) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('forge_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const u = userResult[0];
    res.json({
      user: {
        id: u.id,
        uid: u.uid,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatarUrl,
        fitnessGoal: u.fitnessGoal,
        age: u.age,
        createdAt: u.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Could not fetch session profile.' });
  }
});

app.put('/api/auth/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone, fitnessGoal, age } = req.body;
    const updated = await db
      .update(users)
      .set({
        name: name ? name.trim() : undefined,
        phone: phone || null,
        fitnessGoal: fitnessGoal || undefined,
        age: age ? Number(age) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user!.id))
      .returning();

    res.json({ user: updated[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// -------------------------------------------------------------
// Admin & Staff Authentication
// -------------------------------------------------------------
app.post('/api/admin/login', rateLimiter(15), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminRecord = await db.select().from(admins).where(eq(admins.email, normalizedEmail));

    if (adminRecord.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const admin = adminRecord[0];
    const isMatch = await comparePassword(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Update last login
    await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));

    const token = generateToken({
      id: admin.id,
      uid: `admin_${admin.id}`,
      email: admin.email,
      name: admin.name,
      role: admin.role as 'ADMIN' | 'STAFF',
    });

    res.cookie('forge_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        phone: admin.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed.' });
  }
});

app.get('/api/admin/me', requireStaffOrAdmin, (req: AuthRequest, res) => {
  res.json({ admin: req.user });
});

// -------------------------------------------------------------
// Programs & Membership Plans
// -------------------------------------------------------------
app.get('/api/programs', async (req, res) => {
  try {
    const allPrograms = await db.select().from(programs);
    const parsed = allPrograms.map((p) => ({
      ...p,
      benefits: JSON.parse(p.benefits || '[]'),
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load programs.' });
  }
});

app.get('/api/membership-plans', async (req, res) => {
  try {
    const plans = await db.select().from(membershipPlans).orderBy(membershipPlans.price);
    const parsed = plans.map((p) => ({
      ...p,
      features: JSON.parse(p.features || '[]'),
      benefits: JSON.parse(p.benefits || '[]'),
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load membership plans.' });
  }
});

// -------------------------------------------------------------
// Memberships (Customer & Admin)
// -------------------------------------------------------------
app.get('/api/memberships/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userMemberships = await db
      .select({
        membership: memberships,
        plan: membershipPlans,
      })
      .from(memberships)
      .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
      .where(eq(memberships.userId, req.user!.id))
      .orderBy(desc(memberships.createdAt));

    if (userMemberships.length === 0) {
      return res.json({ currentMembership: null, history: [] });
    }

    const parsed = userMemberships.map((item) => ({
      ...item.membership,
      plan: item.plan
        ? {
            ...item.plan,
            features: JSON.parse(item.plan.features || '[]'),
            benefits: JSON.parse(item.plan.benefits || '[]'),
          }
        : null,
    }));

    res.json({
      currentMembership: parsed[0],
      history: parsed,
    });
  } catch (error) {
    console.error('Fetch my memberships error:', error);
    res.status(500).json({ error: 'Failed to fetch membership details.' });
  }
});

app.post('/api/memberships/subscribe', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { planId, paymentMethod } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Please select a membership plan.' });
    }

    const planResult = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.id, Number(planId)));

    if (planResult.length === 0) {
      return res.status(404).json({ error: 'Selected plan not found.' });
    }

    const plan = planResult[0];

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 1-month duration

    const newMembership = await db
      .insert(memberships)
      .values({
        userId: req.user!.id,
        planId: plan.id,
        status: 'Active',
        startDate,
        endDate,
        amountPaid: plan.price,
        paymentMethod: paymentMethod || 'UPI / Card',
        notes: `Enrolled via web portal on ${startDate.toDateString()}`,
      })
      .returning();

    // Trigger Email & WhatsApp notifications
    await notifyMembershipPurchase({
      memberName: req.user!.name,
      email: req.user!.email,
      planName: plan.name,
      amount: plan.price,
    });

    res.status(201).json({
      success: true,
      membership: newMembership[0],
      message: `Successfully enrolled in ${plan.name} plan!`,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to complete membership enrollment.' });
  }
});

app.get('/api/admin/memberships', requireStaffOrAdmin, async (req, res) => {
  try {
    const allMemberships = await db
      .select({
        membership: memberships,
        user: users,
        plan: membershipPlans,
      })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
      .orderBy(desc(memberships.createdAt));

    const formatted = allMemberships.map((row) => ({
      ...row.membership,
      user: row.user
        ? {
            id: row.user.id,
            name: row.user.name,
            email: row.user.email,
            phone: row.user.phone,
          }
        : null,
      plan: row.plan
        ? {
            id: row.plan.id,
            name: row.plan.name,
            price: row.plan.price,
          }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memberships.' });
  }
});

app.put('/api/admin/memberships/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const membershipId = Number(req.params.id);

    const updated = await db
      .update(memberships)
      .set({
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      })
      .where(eq(memberships.id, membershipId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update membership.' });
  }
});

// -------------------------------------------------------------
// Free Trial & Leads Management
// -------------------------------------------------------------
app.post('/api/leads/free-trial', rateLimiter(10), async (req, res) => {
  try {
    const { name, phone, email, age, fitnessGoal, preferredTime, previousExperience } = req.body;

    if (!name || !phone || !email || !fitnessGoal || !preferredTime || !previousExperience) {
      return res.status(400).json({ error: 'All fields are required for free trial registration.' });
    }

    // Insert lead into PostgreSQL
    const newLead = await db
      .insert(leads)
      .values({
        name: name.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        age: age ? Number(age) : null,
        fitnessGoal: fitnessGoal.trim(),
        preferredTime: preferredTime.trim(),
        previousExperience: previousExperience.trim(),
        status: 'New',
        notes: 'Submitted via Web Free Trial landing form.',
      })
      .returning();

    // Send email confirmation & WhatsApp alert to gym staff
    await notifyNewLead({
      name: newLead[0].name,
      phone: newLead[0].phone,
      email: newLead[0].email,
      fitnessGoal: newLead[0].fitnessGoal,
      preferredTime: newLead[0].preferredTime,
    });

    res.status(201).json({
      success: true,
      lead: newLead[0],
      message: 'Your free trial has been registered! Check your email and WhatsApp for details.',
    });
  } catch (error: any) {
    console.error('Free trial submission error:', error);
    res.status(500).json({ error: 'Could not process free trial submission.' });
  }
});

app.get('/api/admin/leads', requireStaffOrAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = db.select().from(leads);

    const conditions = [];
    if (status && status !== 'All') {
      conditions.push(eq(leads.status, String(status)));
    }
    if (search) {
      conditions.push(
        or(
          ilike(leads.name, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.phone, `%${search}%`)
        )
      );
    }

    const results = await db
      .select()
      .from(leads)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leads.createdAt));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

app.put('/api/admin/leads/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const { status, notes, assignedStaff } = req.body;

    const updated = await db
      .update(leads)
      .set({
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        assignedStaff: assignedStaff !== undefined ? assignedStaff : undefined,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead.' });
  }
});

app.delete('/api/admin/leads/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    await db.delete(leads).where(eq(leads.id, leadId));
    res.json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead.' });
  }
});

// -------------------------------------------------------------
// Trainers Management
// -------------------------------------------------------------
app.get('/api/trainers', async (req, res) => {
  try {
    const trainerList = await db.select().from(trainers).where(eq(trainers.active, true)).orderBy(trainers.name);
    res.json(trainerList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load trainers.' });
  }
});

app.post('/api/admin/trainers', requireStaffOrAdmin, async (req, res) => {
  try {
    const { name, email, phone, bio, specialization, experience, certifications, imageUrl, instagram } = req.body;

    if (!name || !bio || !specialization || !experience) {
      return res.status(400).json({ error: 'Name, bio, specialization, and experience are required.' });
    }

    const inserted = await db
      .insert(trainers)
      .values({
        name,
        email: email || null,
        phone: phone || null,
        bio,
        specialization,
        experience,
        certifications: certifications || null,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
        instagram: instagram || null,
        active: true,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trainer.' });
  }
});

app.put('/api/admin/trainers/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const trainerId = Number(req.params.id);
    const { name, email, phone, bio, specialization, experience, certifications, imageUrl, instagram, active } = req.body;

    const updated = await db
      .update(trainers)
      .set({
        name: name || undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        bio: bio || undefined,
        specialization: specialization || undefined,
        experience: experience || undefined,
        certifications: certifications !== undefined ? certifications : undefined,
        imageUrl: imageUrl || undefined,
        instagram: instagram !== undefined ? instagram : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      })
      .where(eq(trainers.id, trainerId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trainer.' });
  }
});

app.delete('/api/admin/trainers/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const trainerId = Number(req.params.id);
    await db.update(trainers).set({ active: false }).where(eq(trainers.id, trainerId));
    res.json({ success: true, message: 'Trainer deactivated.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trainer.' });
  }
});

// -------------------------------------------------------------
// Classes & Schedule
// -------------------------------------------------------------
app.get('/api/classes', async (req: AuthRequest, res) => {
  try {
    const { category, date } = req.query;

    const conditions = [];
    if (category && category !== 'All') {
      conditions.push(eq(classes.category, String(category)));
    }
    if (date) {
      conditions.push(eq(classes.date, String(date)));
    }

    const classList = await db
      .select({
        gymClass: classes,
        trainer: trainers,
      })
      .from(classes)
      .leftJoin(trainers, eq(classes.trainerId, trainers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(classes.date, classes.startTime);

    // If user is authenticated, check which classes they have registered for
    let userRegisteredClassIds = new Set<number>();
    if (req.user) {
      const userRegs = await db
        .select()
        .from(classRegistrations)
        .where(
          and(
            eq(classRegistrations.userId, req.user.id),
            eq(classRegistrations.status, 'Confirmed')
          )
        );
      userRegisteredClassIds = new Set(userRegs.map((r) => r.classId));
    }

    const results = classList.map((item) => ({
      ...item.gymClass,
      trainer: item.trainer,
      isRegistered: userRegisteredClassIds.has(item.gymClass.id),
      isFull: item.gymClass.bookedCount >= item.gymClass.capacity,
    }));

    res.json(results);
  } catch (error) {
    console.error('Fetch classes error:', error);
    res.status(500).json({ error: 'Failed to load class schedule.' });
  }
});

app.post('/api/classes/:id/register', requireAuth, async (req: AuthRequest, res) => {
  try {
    const classId = Number(req.params.id);

    // Fetch class
    const targetClasses = await db
      .select({
        gymClass: classes,
        trainer: trainers,
      })
      .from(classes)
      .leftJoin(trainers, eq(classes.trainerId, trainers.id))
      .where(eq(classes.id, classId));

    if (targetClasses.length === 0) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    const currentClass = targetClasses[0].gymClass;
    const trainer = targetClasses[0].trainer;

    // Check capacity
    if (currentClass.bookedCount >= currentClass.capacity) {
      return res.status(400).json({ error: 'Class is completely booked to maximum capacity.' });
    }

    // Check if already registered
    const existing = await db
      .select()
      .from(classRegistrations)
      .where(
        and(
          eq(classRegistrations.classId, classId),
          eq(classRegistrations.userId, req.user!.id),
          eq(classRegistrations.status, 'Confirmed')
        )
      );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already registered for this class session.' });
    }

    // Create registration
    const newRegistration = await db
      .insert(classRegistrations)
      .values({
        classId,
        userId: req.user!.id,
        customerName: req.user!.name,
        customerEmail: req.user!.email,
        status: 'Confirmed',
      })
      .returning();

    // Increment booked count
    await db
      .update(classes)
      .set({ bookedCount: currentClass.bookedCount + 1 })
      .where(eq(classes.id, classId));

    // Send confirmation email
    await notifyClassBooking({
      memberName: req.user!.name,
      email: req.user!.email,
      classTitle: currentClass.title,
      date: currentClass.date,
      time: currentClass.startTime,
      trainerName: trainer ? trainer.name : 'FORGE Head Coach',
    });

    res.status(201).json({
      success: true,
      registration: newRegistration[0],
      message: `Spot confirmed for ${currentClass.title}!`,
    });
  } catch (error: any) {
    console.error('Class registration error:', error);
    res.status(500).json({ error: 'Failed to reserve class spot.' });
  }
});

app.post('/api/classes/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const classId = Number(req.params.id);

    const reg = await db
      .select()
      .from(classRegistrations)
      .where(
        and(
          eq(classRegistrations.classId, classId),
          eq(classRegistrations.userId, req.user!.id),
          eq(classRegistrations.status, 'Confirmed')
        )
      );

    if (reg.length === 0) {
      return res.status(404).json({ error: 'Active booking not found for this class.' });
    }

    await db
      .update(classRegistrations)
      .set({ status: 'Cancelled' })
      .where(eq(classRegistrations.id, reg[0].id));

    // Decrement class booked count
    const target = await db.select().from(classes).where(eq(classes.id, classId));
    if (target.length > 0 && target[0].bookedCount > 0) {
      await db
        .update(classes)
        .set({ bookedCount: target[0].bookedCount - 1 })
        .where(eq(classes.id, classId));
    }

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

app.get('/api/classes/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const myRegistrations = await db
      .select({
        registration: classRegistrations,
        gymClass: classes,
        trainer: trainers,
      })
      .from(classRegistrations)
      .innerJoin(classes, eq(classRegistrations.classId, classes.id))
      .leftJoin(trainers, eq(classes.trainerId, trainers.id))
      .where(eq(classRegistrations.userId, req.user!.id))
      .orderBy(desc(classRegistrations.bookedAt));

    const formatted = myRegistrations.map((row) => ({
      ...row.registration,
      classDetails: {
        ...row.gymClass,
        trainer: row.trainer,
      },
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch personal bookings.' });
  }
});

// Admin Class Management
app.post('/api/admin/classes', requireStaffOrAdmin, async (req, res) => {
  try {
    const { title, category, description, trainerId, date, startTime, endTime, capacity, room, intensity } = req.body;

    if (!title || !category || !trainerId || !date || !startTime || !capacity) {
      return res.status(400).json({ error: 'Required class parameters missing.' });
    }

    const inserted = await db
      .insert(classes)
      .values({
        title,
        category,
        description: description || 'High-performance conditioning session.',
        trainerId: Number(trainerId),
        date,
        startTime,
        endTime: endTime || startTime,
        capacity: Number(capacity),
        bookedCount: 0,
        room: room || 'Main Arena',
        intensity: intensity || 'High',
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class.' });
  }
});

app.put('/api/admin/classes/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { title, category, description, trainerId, date, startTime, endTime, capacity, room, intensity } = req.body;

    const updated = await db
      .update(classes)
      .set({
        title: title || undefined,
        category: category || undefined,
        description: description || undefined,
        trainerId: trainerId ? Number(trainerId) : undefined,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        room: room || undefined,
        intensity: intensity || undefined,
      })
      .where(eq(classes.id, classId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class.' });
  }
});

app.delete('/api/admin/classes/:id', requireStaffOrAdmin, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    await db.delete(classRegistrations).where(eq(classRegistrations.classId, classId));
    await db.delete(classes).where(eq(classes.id, classId));
    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class.' });
  }
});

// -------------------------------------------------------------
// Admin Dashboard Metrics & Audit
// -------------------------------------------------------------
app.get('/api/admin/metrics', requireStaffOrAdmin, async (req, res) => {
  try {
    const totalMembersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeMembersCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(memberships)
      .where(eq(memberships.status, 'Active'));

    const newLeadsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, 'New'));

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysClassesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(classes)
      .where(eq(classes.date, todayStr));

    const revenueResult = await db
      .select({ sum: sql<number>`COALESCE(sum(${memberships.amountPaid}), 0)` })
      .from(memberships);

    // Upcoming renewals in next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const renewalsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(memberships)
      .where(and(eq(memberships.status, 'Active'), lte(memberships.endDate, nextWeek)));

    res.json({
      totalMembers: Number(totalMembersCount[0]?.count || 0),
      activeMembers: Number(activeMembersCount[0]?.count || 0),
      newLeads: Number(newLeadsCount[0]?.count || 0),
      todaysClasses: Number(todaysClassesCount[0]?.count || 0),
      monthlyRevenue: Number(revenueResult[0]?.sum || 0),
      upcomingRenewals: Number(renewalsCount[0]?.count || 0),
    });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({ error: 'Failed to calculate dashboard metrics.' });
  }
});

app.get('/api/admin/customers', requireStaffOrAdmin, async (req, res) => {
  try {
    const customerList = await db
      .select({
        id: users.id,
        uid: users.uid,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        fitnessGoal: users.fitnessGoal,
        age: users.age,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

    res.json(customerList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer directory.' });
  }
});

app.get('/api/admin/notifications', requireStaffOrAdmin, async (req, res) => {
  try {
    const logs = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notification logs.' });
  }
});

app.post('/api/admin/notifications/test', requireStaffOrAdmin, async (req, res) => {
  try {
    const { type, recipient, message } = req.body;
    const sent = await sendNotification({
      type: type || 'WHATSAPP',
      category: 'FREE_TRIAL',
      recipient: recipient || 'GYM_DESK',
      subject: 'Manual Test Notification',
      content: message || 'This is a test notification from FORGE Admin Console.',
    });
    res.json({ success: true, log: sent });
  } catch (error) {
    res.status(500).json({ error: 'Test dispatch failed.' });
  }
});

// -------------------------------------------------------------
// Settings Management
// -------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  try {
    const publicKeys = ['gym_name', 'gym_tagline', 'gym_phone', 'gym_email', 'gym_address', 'business_hours', 'analytics_id'];
    const all = await db.select().from(settings);
    const filtered = all.filter((s) => publicKeys.includes(s.key));
    const kv = Object.fromEntries(filtered.map((s) => [s.key, s.value]));
    res.json(kv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load public settings.' });
  }
});

app.get('/api/admin/settings', requireStaffOrAdmin, async (req, res) => {
  try {
    const all = await db.select().from(settings).orderBy(settings.key);
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load system settings.' });
  }
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    const existing = await db.select().from(settings).where(eq(settings.key, key));
    if (existing.length > 0) {
      await db
        .update(settings)
        .set({
          value,
          description: description !== undefined ? description : existing[0].description,
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value, description: description || null });
    }

    res.json({ success: true, key, value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save setting.' });
  }
});

// -------------------------------------------------------------
// Configurable Analytics Tracker
// -------------------------------------------------------------
app.post('/api/analytics/track', (req, res) => {
  const { eventName, properties } = req.body;
  // In production, forward to Google Analytics 4 Measurement Protocol or Segment
  console.log(`[ANALYTICS] Event: ${eventName}`, properties);
  res.json({ success: true, tracked: true });
});

// -------------------------------------------------------------
// Vite Middlewares / Production Static Files
// -------------------------------------------------------------
async function startServer() {
  // Initial seed check on boot
  try {
    await runSeed();
  } catch (seedErr) {
    console.error('Seed error during server boot:', seedErr);
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FORGE Performance Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
