const authkey = process.env.MSG91_AUTHKEY!
const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER!
const namespace = process.env.MSG91_WA_NAMESPACE!

interface ReminderParams {
  docName: string
  businessName: string
  expiryDate: string
}

export async function sendWhatsAppReminder(to: string, params: ReminderParams) {
  const mobile = to.startsWith("+") ? to.slice(1) : to
  const templateName = process.env.MSG91_REMINDER_TEMPLATE ?? "docexpiry_reminder"

  // Template has 2 variables: {{1}} = "DocName (BusinessName)", {{2}} = expiry date
  const docLabel = `${params.docName} (${params.businessName})`

  const response = await fetch(
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
            namespace,
            to_and_components: [
              {
                to: [mobile],
                components: {
                  body_1: { type: "text", value: docLabel },
                  body_2: { type: "text", value: params.expiryDate },
                },
              },
            ],
          },
        },
      }),
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`MSG91 error ${response.status}: ${text}`)
  }

  return response.json()
}
