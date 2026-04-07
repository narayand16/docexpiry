export type BusinessType =
  | "restaurant"
  | "clinic"
  | "retail"
  | "transport"
  | "contractor"
  | "other";

export type DocumentStatus = "expired" | "critical" | "upcoming" | "safe";

export type ReminderType =
  | "90_days"
  | "30_days"
  | "7_days"
  | "1_day"
  | "expired";

export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: BusinessType;
  city: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  business_id: string;
  name: string;
  expiry_date: string; // ISO date string: 'YYYY-MM-DD'
  issued_by: string | null;
  notes: string | null;
  status: DocumentStatus; // computed by DB
  created_at: string;
  updated_at: string;
}

export interface ReminderPreferences {
  id: string;
  user_id: string;
  phone_number: string;
  remind_90_days: boolean;
  remind_30_days: boolean;
  remind_7_days: boolean;
  remind_1_day: boolean;
}

export interface ReminderLog {
  id: string;
  document_id: string;
  reminder_type: ReminderType;
  sent_at: string;
}
