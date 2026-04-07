import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("reminder_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    phone_number,
    remind_90_days,
    remind_30_days,
    remind_7_days,
    remind_1_day,
  } = body;

  if (!phone_number) {
    return NextResponse.json(
      { error: "phone_number is required" },
      { status: 400 },
    );
  }

  // Basic phone validation
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(phone_number)) {
    return NextResponse.json(
      { error: "Invalid phone number format" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("reminder_preferences")
    .upsert(
      {
        user_id: user.id,
        phone_number,
        remind_90_days: remind_90_days ?? true,
        remind_30_days: remind_30_days ?? true,
        remind_7_days: remind_7_days ?? true,
        remind_1_day: remind_1_day ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
