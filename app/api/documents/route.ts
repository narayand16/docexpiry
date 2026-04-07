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

  // Get user's business first
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!business) {
    return NextResponse.json({ documents: [] });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("business_id", business.id)
    .order("expiry_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data ?? [] });
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
  const { business_id, name, expiry_date, issued_by, notes } = body;

  if (!business_id || !name || !expiry_date) {
    return NextResponse.json(
      { error: "business_id, name, and expiry_date are required" },
      { status: 400 },
    );
  }

  // Validate the business belongs to the user
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", business_id)
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(expiry_date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      business_id,
      name: String(name).slice(0, 200),
      expiry_date,
      issued_by: issued_by ? String(issued_by).slice(0, 200) : null,
      notes: notes ? String(notes).slice(0, 500) : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: data }, { status: 201 });
}
