import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { ReminderType } from "@/types";

interface DocumentWithReminder {
  id: string;
  name: string;
  expiry_date: string;
  business_name: string;
  phone_number: string;
  user_id: string;
  remind_90_days: boolean;
  remind_30_days: boolean;
  remind_7_days: boolean;
  remind_1_day: boolean;
}

function getReminderMessage(
  docName: string,
  businessName: string,
  expiryDate: string,
  reminderType: ReminderType,
): string {
  const date = new Date(expiryDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  switch (reminderType) {
    case "90_days":
      return `Hi! 📋 Your *${docName}* for ${businessName} expires on ${date}.\nThat's 3 months away — a good time to start the renewal process.\nReply STOP to opt out. — DocExpiry`;
    case "30_days":
      return `⚠️ Heads up: *${docName}* for ${businessName} expires on ${date}.\n30 days left. Initiate renewal to avoid last-minute stress.\n— DocExpiry`;
    case "7_days":
      return `🚨 *${docName}* expires in 7 days (${date}).\nOperating without a valid license can mean fines or closure.\nRenew immediately. — DocExpiry`;
    case "1_day":
      return `🚨 FINAL REMINDER: *${docName}* expires TOMORROW (${date}).\nPlease take action today. — DocExpiry`;
    case "expired":
      return `❌ *${docName}* for ${businessName} expired on ${date}.\nRenew urgently to avoid penalties. — DocExpiry`;
  }
}

export async function processReminders() {
  return await processRemindersManual();
}

function getReminderTypesForDocument(
  doc: DocumentWithReminder,
): ReminderType[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(doc.expiry_date);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const types: ReminderType[] = [];
  if (diffDays === 90) types.push("90_days");
  if (diffDays === 30) types.push("30_days");
  if (diffDays === 7) types.push("7_days");
  if (diffDays === 1) types.push("1_day");
  if (diffDays >= -3 && diffDays <= 0) types.push("expired");

  return types;
}

function shouldSendReminder(
  doc: DocumentWithReminder,
  type: ReminderType,
): boolean {
  switch (type) {
    case "90_days":
      return doc.remind_90_days;
    case "30_days":
      return doc.remind_30_days;
    case "7_days":
      return doc.remind_7_days;
    case "1_day":
      return doc.remind_1_day;
    case "expired":
      return true; // always send expired alerts
  }
}

async function processRemindersManual() {
  const supabase = await createServiceClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDates = [90, 30, 7, 1, 0, -1, -2, -3].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  });

  // Get documents expiring on target dates
  const { data: documents, error: docError } = await supabase
    .from("documents")
    .select(
      `
      id, name, expiry_date,
      businesses!inner(name, user_id)
    `,
    )
    .in("expiry_date", targetDates);

  if (docError || !documents) return { sent: 0, errors: 0 };

  let sent = 0;
  let errors = 0;

  for (const doc of documents) {
    const business = doc.businesses as unknown as {
      name: string;
      user_id: string;
    };

    // Get reminder prefs for this user
    const { data: prefs } = await supabase
      .from("reminder_preferences")
      .select("*")
      .eq("user_id", business.user_id)
      .single();

    if (!prefs) continue;

    const docWithReminder: DocumentWithReminder = {
      id: doc.id,
      name: doc.name,
      expiry_date: doc.expiry_date,
      business_name: business.name,
      phone_number: prefs.phone_number,
      user_id: business.user_id,
      remind_90_days: prefs.remind_90_days,
      remind_30_days: prefs.remind_30_days,
      remind_7_days: prefs.remind_7_days,
      remind_1_day: prefs.remind_1_day,
    };

    const reminderTypes = getReminderTypesForDocument(docWithReminder);

    for (const reminderType of reminderTypes) {
      const { data: existing } = await supabase
        .from("reminder_log")
        .select("id")
        .eq("document_id", doc.id)
        .eq("reminder_type", reminderType)
        .limit(1);

      if (existing && existing.length > 0) continue;
      if (!shouldSendReminder(docWithReminder, reminderType)) continue;

      try {
        const message = getReminderMessage(
          doc.name,
          business.name,
          doc.expiry_date,
          reminderType,
        );
        await sendWhatsAppMessage(prefs.phone_number, message);

        await supabase.from("reminder_log").insert({
          document_id: doc.id,
          reminder_type: reminderType,
        });

        sent++;
      } catch {
        errors++;
      }
    }
  }

  return { sent, errors };
}
