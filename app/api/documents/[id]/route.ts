import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { computeStatus } from "@/lib/status";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, expiry_date, issued_by, notes } = body;

  if (!name || !expiry_date) {
    return NextResponse.json(
      { error: "name and expiry_date are required" },
      { status: 400 },
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(expiry_date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // Ensure doc belongs to user's business
  const { data: doc } = await supabase
    .from("documents")
    .select("id, businesses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const business = doc.businesses as unknown as { user_id: string };
  if (business.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("documents")
    .update({
      name: String(name).slice(0, 200),
      expiry_date,
      issued_by: issued_by ? String(issued_by).slice(0, 200) : null,
      notes: notes ? String(notes).slice(0, 500) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ document: { ...data, status: computeStatus(data.expiry_date) } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure doc belongs to user's business
  const { data: doc } = await supabase
    .from("documents")
    .select("id, businesses!inner(user_id)")
    .eq("id", id)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const business = doc.businesses as unknown as { user_id: string };
  if (business.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
