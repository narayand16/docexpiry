import "@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// ─── Environment Variables ────────────────────────────────────────────────────
const SUPABASE_WEBHOOK_SECRET_BASE64 = Deno.env.get("SUPABASE_WEBHOOK_SECRET")!;
const MSG91_AUTHKEY = Deno.env.get("MSG91_AUTHKEY")!;
const MSG91_FLOW_ID = Deno.env.get("MSG91_FLOW_ID")!;

const MSG91_API_URL = "https://control.msg91.com/api/v5/flow";

// ─── Types ────────────────────────────────────────────────────────────────────
type HookPayload = {
  user?: { phone?: string };
  sms?: { otp?: string };
};

// ─── Test Phone Numbers (blocked from real SMS) ──────────────────────────────
const TEST_PHONE_NUMBERS = [
  "919999999999",
  "919999999998",
  "918888888888",
];

function isTestPhoneNumber(phoneNumber: string): boolean {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, "");
  return TEST_PHONE_NUMBERS.some((test) => digitsOnly.endsWith(test));
}

// ─── Phone Number Normalization (E.164 for India) ────────────────────────────
function normalizeToE164(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    const digitsOnly = cleaned.replace(/\+/g, "");
    if (digitsOnly.length === 10) return `+91${digitsOnly}`;
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91"))
      return `+${digitsOnly}`;
    if (digitsOnly.length === 11 && digitsOnly.startsWith("0"))
      return `+91${digitsOnly.substring(1)}`;
  }
  return cleaned;
}

// ─── MSG91 SMS Sender ────────────────────────────────────────────────────────
async function sendViaMSG91(otp: string, toNumber: string) {
  const payload = {
    template_id: MSG91_FLOW_ID,
    short_url: "0",
    recipients: [
      {
        mobiles: toNumber,
        otp: otp,
        app: "DocExpiry",
      },
    ],
  };

  return fetch(MSG91_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: MSG91_AUTHKEY,
    },
    body: JSON.stringify(payload),
  });
}

// ─── Edge Function Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    // 1. Verify the webhook signature from Supabase
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(SUPABASE_WEBHOOK_SECRET_BASE64);
    const { user, sms } = wh.verify(payload, headers) as HookPayload;

    const phone = user?.phone ?? "";
    const otp = sms?.otp ?? "";

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: { http_code: 400, message: "Missing phone or OTP in payload" } }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Normalize phone number to E.164
    const e164Phone = normalizeToE164(phone);

    // 3. Block test phone numbers from real SMS delivery
    if (isTestPhoneNumber(e164Phone)) {
      return new Response(
        JSON.stringify({ message: "SMS blocked for test number" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Send OTP via MSG91
    const response = await sendViaMSG91(otp, e164Phone);

    if (response.status !== 200) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: {
            http_code: response.status,
            message: errorText,
          },
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Webhook verification failure or unexpected error
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: { http_code: 500, message } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
