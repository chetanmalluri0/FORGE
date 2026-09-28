import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './index.ts';
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
} from './schema.ts';

export async function runSeed() {
  console.log('--- Starting FORGE database seeding ---');

  // Check if already seeded
  const existingPlans = await db.select().from(membershipPlans);
  if (existingPlans.length > 0) {
    console.log('Database already contains records. Skipping destructive seed.');
    return;
  }

  // 1. Seed Settings
  console.log('Seeding settings...');
  await db.insert(settings).values([
    {
      key: 'gym_name',
      value: 'FORGE Performance Lab',
      description: 'Official brand name',
    },
    {
      key: 'gym_tagline',
      value: 'Build Strength. Build Discipline.',
      description: 'Brand core tagline',
    },
    {
      key: 'gym_phone',
      value: '+91 98765 43210',
      description: 'Front desk and customer support phone',
    },
    {
      key: 'gym_email',
      value: 'contact@forgeperformancelab.in',
      description: 'Support and contact email',
    },
    {
      key: 'gym_address',
      value: 'Plot 42, Sector 18, Cyber Hub Corridor, Bengaluru, KA 560001',
      description: 'Physical studio address',
    },
    {
      key: 'whatsapp_number',
      value: '+919876543210',
      description: 'Target WhatsApp number for real-time lead and trial alerts',
    },
    {
      key: 'whatsapp_api_provider',
      value: 'CloudAPI / Twilio / DirectWebhook',
      description: 'Configurable WhatsApp integration bridge',
    },
    {
      key: 'analytics_id',
      value: 'G-FORGE2026DEMO',
      description: 'Measurement and event tracking ID',
    },
    {
      key: 'business_hours',
      value: 'Mon-Sat: 05:30 AM - 10:30 PM | Sun: 07:00 AM - 08:00 PM',
      description: 'Studio operating schedule',
    },
  ]);

  // 2. Seed Membership Plans
  console.log('Seeding membership plans...');
  const insertedPlans = await db
    .insert(membershipPlans)
    .values([
      {
        name: 'Basic',
        slug: 'basic',
        price: 1999,
        duration: '1 Month',
        description: 'Ideal for independent lifters seeking access to iron & conditioning gear.',
        features: JSON.stringify([
          'Full Gym Floor & Free Weights Access',
          'Standard Locker & Shower Access',
          'Free Orientation & Movement Screen',
          'Water Bar & Hydration Station',
          'Mobile App Access & Workout Tracking',
        ]),
        benefits: JSON.stringify([
          'Flexible monthly rolling contract',
          'Access during all operating hours',
          'Access to FORGE community Discord/WhatsApp group',
        ]),
        popular: false,
      },
      {
        name: 'Pro',
        slug: 'pro',
        price: 2999,
        duration: '1 Month',
        description: 'Our most popular tier. Unlimited group classes, high-intensity conditioning, and recovery.',
        features: JSON.stringify([
          'Everything in Basic Plan',
          'Unlimited Group Classes (Strength, HIIT, Boxing)',
          'Weekly Body Composition & InBody Scans',
          'Infrared Sauna & Contrast Cold Plunge (2x/month)',
          '1 Complimentary 1-on-1 PT Consultation',
          '15% Discount on Lab Merchandise & Supplements',
        ]),
        benefits: JSON.stringify([
          'Guaranteed class booking priority 48h in advance',
          'Quarterly strength progression benchmark reviews',
          'Free guest pass every month',
        ]),
        popular: true,
      },
      {
        name: 'Elite',
        slug: 'elite',
        price: 4999,
        duration: '1 Month',
        description: 'Uncompromising performance. Dedicated coaching, recovery suite, and bespoke nutrition.',
        features: JSON.stringify([
          'Everything in Pro Plan',
          'Dedicated Personal Trainer (4 sessions/month)',
          'Bespoke Athletic Nutrition & Macro Plan',
          'Unlimited Infrared Sauna & Cold Plunge Recovery',
          'Private VIP Locker & Laundry Service',
          'Priority VIP Class Reservations (7 days ahead)',
          'Monthly Blood Biomarker Consultation',
        ]),
        benefits: JSON.stringify([
          'Direct 24/7 WhatsApp hotline to Head Strength Coach',
          'Complete recovery suite access',
          '2 Free Guest Passes per month',
        ]),
        popular: false,
      },
    ])
    .returning();

  // 3. Seed Admins & Staff
  console.log('Seeding admins & staff...');
  const adminPasswordHash = await bcrypt.hash('ForgeAdmin2026!', 10);
  const staffPasswordHash = await bcrypt.hash('ForgeStaff2026!', 10);

  await db.insert(admins).values([
    {
      name: 'Vikramaditya Rathore',
      email: 'admin@forgefitness.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98801 23456',
    },
    {
      name: 'Pooja Nair',
      email: 'staff@forgefitness.com',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      phone: '+91 98802 34567',
    },
  ]);

  // 4. Seed 15 Trainers
  console.log('Seeding 15 trainers...');
  const trainerData = [
    {
      name: 'Marcus Vance',
      email: 'marcus@forgefitness.com',
      phone: '+91 99001 11001',
      bio: 'Former collegiate powerlifting coach and Olympic weightlifting specialist. Demands ruthless technical precision on the bar.',
      specialization: 'Strength Training & Barbell Precision',
      experience: '12+ Years',
      certifications: 'CSCS, USAW Level 2, FMS Certified',
      imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
      instagram: '@marcus.strength',
    },
    {
      name: 'Dr. Ananya Sen',
      email: 'ananya@forgefitness.com',
      phone: '+91 99001 11002',
      bio: 'Physical therapist turned elite performance coach. Specializes in biomechanics, longevity, and spine-sparing athletic loads.',
      specialization: 'Functional Training & Injury Prevention',
      experience: '9+ Years',
      certifications: 'DPT, NSCA-CPT, EXOS Performance Specialist',
      imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop',
      instagram: '@dr.ananya.strength',
    },
    {
      name: 'Devraj Singh',
      email: 'devraj@forgefitness.com',
      phone: '+91 99001 11003',
      bio: 'National level combat athlete and tactical conditioning director. Turns ordinary people into durable, fatigue-resistant athletes.',
      specialization: 'Boxing & High-Intensity Conditioning',
      experience: '10+ Years',
      certifications: 'WBC Boxing Coach, Kettlebell Hardstyle Master',
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
      instagram: '@devraj_striking',
    },
    {
      name: 'Elena Rostova',
      email: 'elena@forgefitness.com',
      phone: '+91 99001 11004',
      bio: 'Gymnastic strength and mobility coach. Focuses on full range of motion under tension, active flexibility, and joint armor.',
      specialization: 'Mobility & Gymnastic Strength',
      experience: '8+ Years',
      certifications: 'FRC Mobility Specialist, Kinstretch Instructor',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
      instagram: '@elena_mobility',
    },
    {
      name: 'Kabir Mehta',
      email: 'kabir@forgefitness.com',
      phone: '+91 99001 11005',
      bio: 'CrossFit Games regional competitor. Master of aerobic capacity, barbell cycling efficiency, and psychological grit.',
      specialization: 'CrossFit & MetCon',
      experience: '7+ Years',
      certifications: 'CrossFit Level 3 (CCFT), OPEX CCP',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      instagram: '@kabir_metcon',
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan@forgefitness.com',
      phone: '+91 99001 11006',
      bio: 'Sprint mechanics and rotational power coach. Trained elite cricket and badminton players in maximum power output.',
      specialization: 'Athletic Performance & Speed',
      experience: '11+ Years',
      certifications: 'Altis Foundation, CSCS, Precision Nutrition 2',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      instagram: '@rohan_athletics',
    },
    {
      name: 'Tara Balakrishnan',
      email: 'tara@forgefitness.com',
      phone: '+91 99001 11007',
      bio: 'Power Yoga and athletic breathwork practitioner. Integrates nervous system down-regulation with deep hip and hamstring opening.',
      specialization: 'Athletic Yoga & Breath Conditioning',
      experience: '6+ Years',
      certifications: 'RYT 500, Oxygen Advantage Breath Coach',
      imageUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop',
      instagram: '@tara_breathflow',
    },
    {
      name: 'Zane Gallagher',
      email: 'zane@forgefitness.com',
      phone: '+91 99001 11008',
      bio: 'Hypertrophy specialist and competitive bodybuilder. Scientific approach to mechanical tension, metabolic stress, and muscle recovery.',
      specialization: 'Body Composition & Hypertrophy',
      experience: '9+ Years',
      certifications: 'NASM-PES, Menno Henselmans PT',
      imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop',
      instagram: '@zane_hypertrophy',
    },
    {
      name: 'Meera Chawla',
      email: 'meera@forgefitness.com',
      phone: '+91 99001 11009',
      bio: 'Weight management lead and clinical nutritionist. Focuses on sustainable metabolic adaptation and behavioral consistency.',
      specialization: 'Weight Management & Metabolic Health',
      experience: '8+ Years',
      certifications: 'CISSN, ACE Master Trainer, ISSN Sports Nutritionist',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      instagram: '@meera.metabolism',
    },
    {
      name: 'Aditya Roy',
      email: 'aditya@forgefitness.com',
      phone: '+91 99001 11010',
      bio: 'Specialist in heavy deadlifts, bench setups, and neural drive. Mentored over 200 athletes to their first 200kg deadlift.',
      specialization: 'Heavy Barbell Systems',
      experience: '10+ Years',
      certifications: 'Starting Strength Coach, USAPL Coach',
      imageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=800&auto=format&fit=crop',
      instagram: '@aditya_pulls',
    },
    {
      name: 'Siddharth Varma',
      email: 'siddharth@forgefitness.com',
      phone: '+91 99001 11011',
      bio: 'Endurance conditioning and rower ergometer master. Specializes in lactate threshold training and VO2 max improvement.',
      specialization: 'Rowing & Aerobic Engine Building',
      experience: '7+ Years',
      certifications: 'Concept2 Master Trainer, UESCA Ultra Running Coach',
      imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
      instagram: '@sid_endurance',
    },
    {
      name: 'Shreya Kulkarni',
      email: 'shreya@forgefitness.com',
      phone: '+91 99001 11012',
      bio: 'Calisthenics and bodyweight mastery coach. Teaches handstands, muscle-ups, and lever progressions with zero equipment dependency.',
      specialization: 'Bodyweight Mastery & Calisthenics',
      experience: '6+ Years',
      certifications: 'World Calisthenics Organization Level 2',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      instagram: '@shreya_levers',
    },
    {
      name: 'Jason Cruz',
      email: 'jason@forgefitness.com',
      phone: '+91 99001 11013',
      bio: 'Former Muay Thai combatant. Specializes in explosive footwork, rotational core work, and fight-conditioned stamina.',
      specialization: 'Combat Conditioning & Muay Thai',
      experience: '8+ Years',
      certifications: 'Tiger Muay Thai Certified, ISSA Combat Sports Coach',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
      instagram: '@cruz_striking',
    },
    {
      name: 'Nisha Pillai',
      email: 'nisha@forgefitness.com',
      phone: '+91 99001 11014',
      bio: 'Women’s athletic performance and pre/postnatal strength specialist. Helping female athletes break performance ceilings safely.',
      specialization: 'Female Athletic Performance',
      experience: '9+ Years',
      certifications: 'Girls Gone Strong Coach, CSCS',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
      instagram: '@nisha_strongwomen',
    },
    {
      name: 'Farhan Qureshi',
      email: 'farhan@forgefitness.com',
      phone: '+91 99001 11015',
      bio: 'Recovery science and fascia release specialist. Oversees the cold plunge, infrared sauna protocols, and percussion therapy.',
      specialization: 'Recovery & Tissue Regeneration',
      experience: '10+ Years',
      certifications: 'Functional Range Conditioning, RockTape FMT',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
      instagram: '@farhan_recovery',
    },
  ];

  const insertedTrainers = await db.insert(trainers).values(trainerData).returning();

  // 5. Seed Programs
  console.log('Seeding 5 programs...');
  await db.insert(programs).values([
    {
      title: 'Strength Training',
      price: 2499,
      duration: 'Per Month',
      description: 'Progressive barbell overloading, neuromuscular recruitment, and compound lifting mastery for squat, bench, deadlift, and overhead press.',
      benefits: JSON.stringify([
        'Periodized 12-week strength waves',
        'RPE & velocity-based training metrics',
        'Bi-weekly video form reviews',
        'Joint-longevity accessory protocols',
      ]),
      trainerId: insertedTrainers[0].id,
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Personal Training',
      price: 6999,
      duration: 'Per Month (12 Sessions)',
      description: 'Dedicated 1-on-1 private coaching. Every rep, set, meal, and sleep cycle calculated and fine-tuned for your exact biometric goals.',
      benefits: JSON.stringify([
        '100% customized programming tailored to your injuries & goals',
        '1-on-1 dedicated floor attention with master coach',
        'Direct 24/7 WhatsApp coach support',
        'Weekly hormonal & biomarker review recommendations',
      ]),
      trainerId: insertedTrainers[1].id,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Functional Training',
      price: 2999,
      duration: 'Per Month',
      description: 'Multi-planar locomotion, kettlebell complexes, sled pushes, and sandbag carries built for real-world resilience and bulletproof joints.',
      benefits: JSON.stringify([
        'Multi-joint athletic movement patterns',
        'Core rotational power and grip strength',
        'Metabolic conditioning without breakdown',
        'Mobility & posture correction built into every block',
      ]),
      trainerId: insertedTrainers[1].id,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Athletic Performance',
      price: 3499,
      duration: 'Per Month',
      description: 'Designed for competitive sport athletes. Develops rate of force development (RFD), reactive agility, sprint deceleration, and jump height.',
      benefits: JSON.stringify([
        'Force plate and jump mat velocity testing',
        'Multi-directional sprint mechanics',
        'High-velocity plyometrics & contrast training',
        'Sport-specific injury resilience',
      ]),
      trainerId: insertedTrainers[5].id,
      imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Weight Management',
      price: 2999,
      duration: 'Per Month',
      description: 'Targeted body recomposition marrying high-density resistance training, NEAT optimization, and individualized metabolic nutrition planning.',
      benefits: JSON.stringify([
        'Targeted fat loss while preserving lean skeletal muscle',
        'Bi-weekly InBody 570 scan tracking',
        'Dietary macronutrient strategy with zero crash diets',
        'Habit formation coaching & circadian sleep hygiene',
      ]),
      trainerId: insertedTrainers[8].id,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
    },
  ]);

  // 6. Seed 50 Customers
  console.log('Seeding 50 customers...');
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Dhruv', 'Kabir', 'Rudra', 'Atharv', 'Aryan', 'Samarth', 'Rohan', 'Pranav', 'Devansh',
    'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Myra', 'Kavya', 'Pari', 'Isha', 'Avani', 'Rhea',
    'Tanvi', 'Anika', 'Tara', 'Riya', 'Sara', 'Meera', 'Navya', 'Pooja', 'Shruti', 'Nandini',
    'Neil', 'Vikram', 'Tariq', 'Gaurav', 'Manish', 'Harsh', 'Varun', 'Karan', 'Tanmay', 'Alok'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Iyer', 'Menon', 'Nair', 'Patel', 'Reddy', 'Chopra',
    'Deshmukh', 'Singhania', 'Bose', 'Mukherjee', 'Kapoor', 'Mehta', 'Khurana', 'Bhatia', 'Joshi', 'Aggarwal'
  ];
  const goals = [
    'Build Muscle & Raw Strength',
    'Cut Body Fat & Lean Tone',
    'Improve Athletic Speed & Agility',
    'Fix Posture & Lower Back Pain',
    'CrossFit & Metabolic Endurance',
    'Marathon & Aerobic Capacity',
  ];

  const defaultUserPasswordHash = await bcrypt.hash('ForgeMember2026!', 10);
  const usersToInsert = [];

  for (let i = 0; i < 50; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i + 1}@gmail.com`;
    const phone = `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`;

    usersToInsert.push({
      uid: `forge_usr_${1000 + i}`,
      email,
      name: fullName,
      phone,
      passwordHash: defaultUserPasswordHash,
      role: 'CUSTOMER',
      fitnessGoal: goals[i % goals.length],
      age: 22 + (i % 25),
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + (i * 1000000)}?q=80&w=200&auto=format&fit=crop`,
    });
  }

  const insertedUsers = await db.insert(users).values(usersToInsert).returning();

  // 7. Seed Active & Pending Memberships for 35 of the users
  console.log('Seeding memberships for customers...');
  const membershipsToInsert = [];
  const now = new Date();

  for (let i = 0; i < 35; i++) {
    const user = insertedUsers[i];
    const plan = insertedPlans[i % insertedPlans.length];
    const isPending = i % 7 === 0;
    const isExpired = i % 11 === 0;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (i * 2));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    membershipsToInsert.push({
      userId: user.id,
      planId: plan.id,
      status: isExpired ? 'Expired' : isPending ? 'Pending' : 'Active',
      startDate,
      endDate,
      amountPaid: plan.price,
      paymentMethod: i % 2 === 0 ? 'UPI (Google Pay)' : 'Credit Card (Visa)',
      notes: isExpired ? 'Scheduled for renewal contact' : 'Regular monthly tier',
    });
  }

  await db.insert(memberships).values(membershipsToInsert);

  // 8. Seed 20 Leads
  console.log('Seeding 20 leads...');
  const leadStatuses = ['New', 'Contacted', 'Trial Scheduled', 'Converted', 'Not Interested'];
  const leadTimes = ['06:00 AM - 08:00 AM', '08:00 AM - 10:00 AM', '05:00 PM - 07:00 PM', '07:00 PM - 09:00 PM'];
  const leadExperiences = [
    'Complete beginner, never stepped foot in a gym',
    'Lifted inconsistently for 6 months',
    'Former high school athlete returning to fitness',
    '3+ years consistent gym experience, hit a plateau',
    'Recovering from a sports injury looking for structured coaching',
  ];

  const leadsToInsert = [];
  for (let i = 0; i < 20; i++) {
    const fName = firstNames[(i + 15) % firstNames.length];
    const lName = lastNames[(i + 5) % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `lead.${fName.toLowerCase()}.${lName.toLowerCase()}@outlook.com`;
    const phone = `+91 9${Math.floor(200000000 + Math.random() * 800000000)}`;
    const status = leadStatuses[i % leadStatuses.length];

    leadsToInsert.push({
      name,
      phone,
      email,
      age: 21 + (i % 28),
      fitnessGoal: goals[(i + 2) % goals.length],
      preferredTime: leadTimes[i % leadTimes.length],
      previousExperience: leadExperiences[i % leadExperiences.length],
      status,
      notes:
        status === 'Trial Scheduled'
          ? 'Scheduled trial for upcoming Saturday 7:00 AM. Requested barbell coaching.'
          : status === 'Converted'
          ? 'Enrolled into Pro 1-Month plan after trial session.'
          : status === 'Contacted'
          ? 'Called on WhatsApp, sent facility brochure and membership tiers.'
          : 'Brand new web trial lead from website banner.',
      assignedStaff: i % 2 === 0 ? 'Pooja Nair' : 'Vikramaditya Rathore',
    });
  }

  await db.insert(leads).values(leadsToInsert);

  // 9. Seed 20 Classes across Strength, HIIT, CrossFit, Yoga, Mobility, Boxing, Functional Training
  console.log('Seeding 20 classes...');
  const classCategories = [
    {
      title: 'Forge Barbell Heavy',
      category: 'Strength',
      description: 'Compound squat, bench, and barbell deadlift technique with progressive loading and bar speed monitoring.',
      room: 'Main Strength Arena',
      intensity: 'Very High',
      capacity: 12,
    },
    {
      title: 'Engine & Grit HIIT',
      category: 'HIIT',
      description: 'Heart-rate tracked interval sprints on Assault AirBikes, SkiErgs, and heavy sled pushes.',
      room: 'Metabolic Zone',
      intensity: 'Maximum',
      capacity: 16,
    },
    {
      title: 'WOD: Iron Crucible',
      category: 'CrossFit',
      description: 'Olympic lifting complexes paired with high-volume gymnastics and sprint intervals. Scaled to all levels.',
      room: 'The Rig Floor',
      intensity: 'High',
      capacity: 14,
    },
    {
      title: 'Athletic Flow & Spine Mobility',
      category: 'Yoga',
      description: 'Vinyasa tailored specifically for stiff lifters. Unlocks tight hips, thoracic spine, and hamstrings.',
      room: 'Zenith Studio',
      intensity: 'Moderate',
      capacity: 20,
    },
    {
      title: 'Joint Armor & Active Recovery',
      category: 'Mobility',
      description: 'Kinstretch and CARs (Controlled Articular Rotations) to safeguard your tendons and improve active ROM.',
      room: 'Zenith Studio',
      intensity: 'Low - Restorative',
      capacity: 18,
    },
    {
      title: 'Combat Strike & Footwork',
      category: 'Boxing',
      description: 'Heavy bag rounds, boxing defense drills, slip maneuvers, and combat conditioning circuits.',
      room: 'Combat Lab',
      intensity: 'Very High',
      capacity: 14,
    },
    {
      title: 'Kettlebell & Sled Crucible',
      category: 'Functional Training',
      description: 'Turkish get-ups, clean and presses, heavy farmers carries, and sandbag over-shoulder tosses.',
      room: 'Main Strength Arena',
      intensity: 'High',
      capacity: 15,
    },
  ];

  const timeSlots = [
    { start: '06:30 AM', end: '07:30 AM' },
    { start: '07:45 AM', end: '08:45 AM' },
    { start: '09:00 AM', end: '10:00 AM' },
    { start: '05:30 PM', end: '06:30 PM' },
    { start: '06:45 PM', end: '07:45 PM' },
    { start: '08:00 PM', end: '09:00 PM' },
  ];

  const classesToInsert = [];
  const baseDate = new Date();

  for (let i = 0; i < 20; i++) {
    const template = classCategories[i % classCategories.length];
    const slot = timeSlots[i % timeSlots.length];
    const trainer = insertedTrainers[i % insertedTrainers.length];

    const cDate = new Date(baseDate);
    // Spread classes across today, tomorrow, and the next 5 days
    cDate.setDate(cDate.getDate() + Math.floor(i / 3));
    const dateStr = cDate.toISOString().split('T')[0];

    classesToInsert.push({
      title: `${template.title} #${Math.floor(i / 7) + 1}`,
      category: template.category,
      description: template.description,
      trainerId: trainer.id,
      date: dateStr,
      startTime: slot.start,
      endTime: slot.end,
      capacity: template.capacity,
      bookedCount: 0, // will increment as we add registrations
      room: template.room,
      intensity: template.intensity,
    });
  }

  const insertedClasses = await db.insert(classes).values(classesToInsert).returning();

  // 10. Seed 50 Class Registrations
  console.log('Seeding 50 class registrations...');
  const registrationsToInsert = [];
  const classBookingsMap = new Map<number, number>();

  for (let i = 0; i < 50; i++) {
    const targetClass = insertedClasses[i % insertedClasses.length];
    const targetUser = insertedUsers[(i * 3) % insertedUsers.length];

    const currentCount = classBookingsMap.get(targetClass.id) || 0;
    if (currentCount < targetClass.capacity) {
      classBookingsMap.set(targetClass.id, currentCount + 1);

      registrationsToInsert.push({
        classId: targetClass.id,
        userId: targetUser.id,
        customerName: targetUser.name,
        customerEmail: targetUser.email,
        status: i % 15 === 0 ? 'Cancelled' : i % 8 === 0 ? 'Attended' : 'Confirmed',
      });
    }
  }

  await db.insert(classRegistrations).values(registrationsToInsert);

  // Update classes bookedCount according to confirmed bookings
  for (const [clsId, count] of classBookingsMap.entries()) {
    const cls = insertedClasses.find((c) => c.id === clsId);
    if (cls) {
      cls.bookedCount = count;
      // Update in DB
      await db.update(classes).set({ bookedCount: count }).where(eq(classes.id, clsId));
    }
  }

  // 11. Seed sample Notifications
  console.log('Seeding notification logs...');
  await db.insert(notifications).values([
    {
      type: 'WHATSAPP',
      category: 'FREE_TRIAL',
      recipient: '+919876543210',
      subject: 'New Free Trial Submission',
      content: '🚨 [FORGE Trial Alert] Vikram Verma (+91 9880123456) booked a trial for Strength Training at 07:00 AM.',
      status: 'Sent',
    },
    {
      type: 'EMAIL',
      category: 'MEMBERSHIP',
      recipient: 'arjun.mehta1@gmail.com',
      subject: 'Welcome to FORGE Performance Lab — Pro Tier Confirmed',
      content: 'Hi Arjun, your Pro Membership is active. Download your QR pass and book your first class in the member portal.',
      status: 'Sent',
    },
    {
      type: 'EMAIL',
      category: 'CLASS_BOOKING',
      recipient: 'ananya.iyer2@gmail.com',
      subject: 'Class Booking Confirmed: Forge Barbell Heavy',
      content: 'Your slot for tomorrow at 06:30 AM with Coach Marcus Vance is confirmed. Please arrive 10 minutes prior.',
      status: 'Sent',
    },
    {
      type: 'EMAIL',
      category: 'EXPIRY_REMINDER',
      recipient: 'dhruv.sharma14@gmail.com',
      subject: 'Your FORGE Membership Renews in 3 Days',
      content: 'Keep the momentum going. Renew your Basic plan in one click to retain unlimited gym floor access.',
      status: 'Sent',
    },
  ]);

  console.log('✅ FORGE Performance Lab database seeded successfully with 50 customers, 20 leads, 3 plans, 15 trainers, 20 classes, 50 registrations, and settings!');
}
