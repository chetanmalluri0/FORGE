import { db } from '../db/index.ts';
import { notifications, settings } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

interface NotificationParams {
  type: 'EMAIL' | 'WHATSAPP';
  category: 'FREE_TRIAL' | 'MEMBERSHIP' | 'CLASS_BOOKING' | 'EXPIRY_REMINDER';
  recipient: string;
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Dispatches notification and logs record to database.
 * If WhatsApp credentials or SMTP/webhook settings are configured, simulates real-time gateway delivery.
 */
export async function sendNotification(params: NotificationParams) {
  try {
    // 1. Fetch current settings for WhatsApp / Notification endpoints
    const gymSettings = await db.select().from(settings);
    const settingsMap = new Map(gymSettings.map((s) => [s.key, s.value]));
    const targetWhatsapp = settingsMap.get('whatsapp_number') || '+919876543210';

    let actualRecipient = params.recipient;
    // For gym alerts (like new lead or new membership), send to gym's WhatsApp
    if (params.type === 'WHATSAPP' && params.recipient === 'GYM_DESK') {
      actualRecipient = targetWhatsapp;
    }

    // In a live production environment with Twilio or Meta Cloud API:
    // const response = await fetch(whatsappWebhookUrl, { ... });
    console.log(`[DISPATCH ${params.type}] To: ${actualRecipient} | Subject: ${params.subject || 'N/A'}`);
    console.log(`Content: ${params.content}`);

    // 2. Persist notification to DB table
    const result = await db
      .insert(notifications)
      .values({
        type: params.type,
        category: params.category,
        recipient: actualRecipient,
        subject: params.subject || null,
        content: params.content,
        status: 'Sent',
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to log or send notification:', error);
    return null;
  }
}

export async function notifyNewLead(lead: { name: string; phone: string; email: string; fitnessGoal: string; preferredTime: string }) {
  // 1. Email to the prospective member
  await sendNotification({
    type: 'EMAIL',
    category: 'FREE_TRIAL',
    recipient: lead.email,
    subject: 'Your Free Trial at FORGE Performance Lab is Confirmed',
    content: `Hi ${lead.name},\n\nThank you for taking the first step. Your complimentary 1-day pass for "${lead.fitnessGoal}" is locked in for ${lead.preferredTime}.\n\nOur head strength coach will reach out to you on WhatsApp (${lead.phone}) to welcome you and assign your locker.\n\nAddress: Plot 42, Sector 18, Cyber Hub Corridor, Bengaluru\n\nBuild Strength. Build Discipline.\n— The FORGE Coaching Staff`,
    metadata: { leadName: lead.name, phone: lead.phone },
  });

  // 2. WhatsApp notification to gym management
  await sendNotification({
    type: 'WHATSAPP',
    category: 'FREE_TRIAL',
    recipient: 'GYM_DESK',
    subject: 'New Free Trial Lead',
    content: `🔥 *[NEW TRIAL REGISTRATION]*\n*Name:* ${lead.name}\n*Phone:* ${lead.phone}\n*Goal:* ${lead.fitnessGoal}\n*Time:* ${lead.preferredTime}\n*Email:* ${lead.email}\n*Action:* Open Admin Dashboard to schedule session.`,
    metadata: { lead },
  });
}

export async function notifyMembershipPurchase(data: { memberName: string; email: string; phone?: string; planName: string; amount: number }) {
  // 1. Email to member
  await sendNotification({
    type: 'EMAIL',
    category: 'MEMBERSHIP',
    recipient: data.email,
    subject: `Welcome to FORGE Performance Lab — ${data.planName} Tier Activated`,
    content: `Hi ${data.memberName},\n\nWelcome to the brotherhood of iron and discipline. Your ${data.planName} Membership (₹${data.amount.toLocaleString()}) has been activated successfully.\n\nYou now have full access to our facility, coaching staff, and booking portal.\n\nLog in anytime to reserve your class spots or schedule an InBody scan.\n\n— FORGE Performance Lab`,
    metadata: { plan: data.planName, amount: data.amount },
  });

  // 2. WhatsApp alert to gym staff
  await sendNotification({
    type: 'WHATSAPP',
    category: 'MEMBERSHIP',
    recipient: 'GYM_DESK',
    subject: 'New Membership Activated',
    content: `💎 *[NEW MEMBERSHIP ENROLLED]*\n*Athlete:* ${data.memberName}\n*Plan:* ${data.planName}\n*Amount:* ₹${data.amount.toLocaleString()}\n*Email:* ${data.email}`,
    metadata: { data },
  });
}

export async function notifyClassBooking(data: { memberName: string; email: string; classTitle: string; date: string; time: string; trainerName: string }) {
  await sendNotification({
    type: 'EMAIL',
    category: 'CLASS_BOOKING',
    recipient: data.email,
    subject: `Confirmed: ${data.classTitle} with Coach ${data.trainerName}`,
    content: `Hi ${data.memberName},\n\nYour spot in "${data.classTitle}" is secured.\n\nDate: ${data.date}\nTime: ${data.time}\nLead Coach: ${data.trainerName}\n\nPlease bring your lifting shoes and water bottle, and arrive 10 minutes early.\n\n— FORGE Performance Lab`,
    metadata: { classTitle: data.classTitle, date: data.date },
  });
}
