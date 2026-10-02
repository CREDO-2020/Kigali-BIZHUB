import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = claimsData.claims.sub;
  const { data: business } = await supabase.from("businesses").select("id,name").eq("owner_id", userId).maybeSingle();
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const details = String(body.details ?? "").trim();
  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  if (name.length > 160 || details.length > 3000) return NextResponse.json({ error: "Product information is too long." }, { status: 400 });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You write concise, truthful ecommerce copy for small businesses in Rwanda. Never invent specifications, guarantees, certifications, prices, or claims. Return JSON with description, short_description, caption, tags (array)." },
      { role: "user", content: JSON.stringify({ business: business.name, product_name: name, category, details }) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return NextResponse.json({ error: "AI returned no content." }, { status: 502 });

  try {
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "AI returned an invalid response." }, { status: 502 });
  }
}
