// Supabase Send SMS Hook — routes OTP delivery through MSG91 WhatsApp
// Deployed as a Supabase Edge Function; configured in Auth → Hooks → Send SMS

interface HookPayload {
  user?: { phone?: string }
  sms?: { otp?: string }
}

function normalizeToE164(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "")
  if (!cleaned.startsWith("+")) {
    const digits = cleaned.replace(/\+/g, "")
    if (digits.length === 10) return `+91${digits}`
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`
    if (digits.length === 11 && digits.startsWith("0"))
      return `+91${digits.substring(1)}`
  }
  return cleaned
}

async function sendOTPViaMSG91(otp: string, toNumber: string) {
  const authkey = Deno.env.get("MSG91_AUTHKEY")
  const integratedNumber = Deno.env.get("MSG91_INTEGRATED_NUMBER")
  const templateName = Deno.env.get("MSG91_WA_TEMPLATE_NAME")
  const waNamespace = Deno.env.get("MSG91_WA_NAMESPACE")

  if (!authkey || !integratedNumber || !templateName || !waNamespace) {
    throw new Error(
      "MSG91_AUTHKEY, MSG91_INTEGRATED_NUMBER, MSG91_WA_TEMPLATE_NAME, or MSG91_WA_NAMESPACE not configured",
    )
  }

  // WhatsApp API expects number without + prefix, with country code
  const mobile = toNumber.startsWith("+") ? toNumber.slice(1) : toNumber

  return fetch(
    "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey,
      },
      body: JSON.stringify({
        integrated_number: integratedNumber,
        content_type: "template",
        payload: {
          messaging_product: "whatsapp",
          type: "template",
          template: {
            name: templateName,
            language: { code: "en", policy: "deterministic" },
            namespace: waNamespace,
            to_and_components: [
              {
                to: [mobile],
                components: {
                  body_1: { type: "text", value: otp },
                  button_1: { subtype: "url", type: "text", value: otp },
                },
              },
            ],
          },
        },
      }),
    },
  )
}

Deno.serve(async (req) => {
  // Only handle POST requests (Supabase Auth sends POST)
  if (req.method !== "POST") {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const payload = await req.json()
    const phone = payload.sms?.phone ?? payload.user?.phone ?? ""
    const otp = payload.sms?.otp ?? ""

    // If this hook is called without SMS data (e.g. health check),
    // return 200 to avoid breaking the auth flow
    if (!phone || !otp) {
      console.log("SMS Hook: skipped (missing phone or OTP)")
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const e164Phone = normalizeToE164(phone)
    console.log("SMS Hook: sending OTP to", phone.slice(0, 4) + "****")

    const response = await sendOTPViaMSG91(otp, e164Phone)
    const responseText = await response.text()

    if (!response.ok) {
      console.error("SMS Hook: MSG91 error", response.status)
      return new Response(
        JSON.stringify({
          error: { http_code: response.status, message: responseText },
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } },
      )
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("sms-hook error:", message)
    return new Response(
      JSON.stringify({ error: { http_code: 500, message } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
