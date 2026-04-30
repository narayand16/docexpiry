import { processReminders } from "@/lib/reminder-engine";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = `Bearer ${cronSecret}`;
  const isValid =
    authHeader?.length === expected.length &&
    timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processReminders();
    return NextResponse.json({
      success: true,
      sent: result.sent,
      errors: result.errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
