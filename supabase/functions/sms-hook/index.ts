// @ts-nocheck — This is a Deno Edge Function; Deno types are not available in the Node/Next.js TS config
import "@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// ─── Environment Variables ────────────────────────────────────────────────────
const SUPABASE_WEBHOOK_SECRET_BASE64 = Deno.env.get("SUPABASE_WEBHOOK_SECRET")!;
const MSG91_AUTHKEY = Deno.env.get("MSG91_AUTHKEY")!;
const MSG91_TEMPLATE_NAME = Deno.env.get("MSG91_TEMPLATE_NAME")!;

const MSG91_WHATSAPP_URL = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

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
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
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

// ─── MSG91 WhatsApp Sender ───────────────────────────────────────────────────
async function sendViaMSG91WhatsApp(otp: string, toNumber: string) {
  // MSG91 WhatsApp API expects the number without the '+' prefix
  const mobiles = toNumber.startsWith("+") ? toNumber.slice(1) : toNumber;

  const payload = {
    integrated_number: Deno.env.get("MSG91_WHATSAPP_NUMBER")!,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: MSG91_TEMPLATE_NAME,
        language: {
          code: "en",
          policy: "deterministic",
        },
        namespace: Deno.env.get("MSG91_WHATSAPP_NAMESPACE") ?? "",
        to_and_components: [
          {
            to: [mobiles],
            components: {
              body: [
                { type: "text", value: otp },
              ],
            },
          },
        ],
      },
    },
  };

  return fetch(MSG91_WHATSAPP_URL, {
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

    // 3. Block test phone numbers from real delivery
    if (isTestPhoneNumber(e164Phone)) {
      return new Response(
        JSON.stringify({ message: "OTP blocked for test number" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Send OTP via MSG91 WhatsApp
    const response = await sendViaMSG91WhatsApp(otp, e164Phone);

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
