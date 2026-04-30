-- DocExpiry V1 — Database Schema
-- Run this in your Supabase SQL Editor

-- Businesses
CREATE TABLE businesses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('restaurant','clinic','retail','transport','contractor','other')),
  city        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  expiry_date  DATE NOT NULL,
  issued_by    TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder preferences (only populated after phone number is provided)
CREATE TABLE reminder_preferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number     TEXT NOT NULL,
  remind_90_days   BOOLEAN DEFAULT TRUE,
  remind_30_days   BOOLEAN DEFAULT TRUE,
  remind_7_days    BOOLEAN DEFAULT TRUE,
  remind_1_day     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder log (prevents duplicate WhatsApp messages)
CREATE TABLE reminder_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    UUID REFERENCES documents(id) ON DELETE CASCADE,
  reminder_type  TEXT NOT NULL,  -- '90_days' | '30_days' | '7_days' | '1_day' | 'expired'
  sent_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE businesses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_log         ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "owner access" ON businesses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "owner access via business" ON documents
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "owner access" ON reminder_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "owner access via document" ON reminder_log
  FOR ALL USING (document_id IN (
    SELECT d.id FROM documents d
    JOIN businesses b ON d.business_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_documents_business_id ON documents(business_id);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_reminder_log_document_id ON reminder_log(document_id);
CREATE INDEX idx_reminder_preferences_user_id ON reminder_preferences(user_id);
