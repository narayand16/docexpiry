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
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ business: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, city } = body;

  if (!name || !type) {
    return NextResponse.json(
      { error: "Name and type are required" },
      { status: 400 },
    );
  }

  const validTypes = [
    "restaurant",
    "clinic",
    "retail",
    "transport",
    "contractor",
    "other",
  ];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: "Invalid business type" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name: String(name).slice(0, 200),
      type,
      city: city ? String(city).slice(0, 100) : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ business: data }, { status: 201 });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete businesses (cascades to documents → reminder_log via FK)
  const { error: bizError } = await supabase
    .from("businesses")
    .delete()
    .eq("user_id", user.id);

  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 });
  }

  // Delete reminder preferences (separate table, keyed on user_id)
  await supabase
    .from("reminder_preferences")
    .delete()
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
