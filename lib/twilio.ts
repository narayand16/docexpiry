import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!;

const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, body: string) {
  const message = await client.messages.create({
    from: whatsappFrom,
    to: `whatsapp:${to}`,
    body,
  });
  return message.sid;
}
