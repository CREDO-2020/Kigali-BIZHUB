import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    if (!claimsData?.claims?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = claimsData.claims.sub;
    const { data: business } = await supabase
      .from("businesses")
      .select("id,name")
      .eq("owner_id", userId)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI is not configured on the server." }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const details = String(body.details ?? "").trim();

    if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    if (name.length > 160 || details.length > 3000) {
      return NextResponse.json({ error: "Product information is too long." }, { status: 400 });
    }

    const response = await openai.responses.create({
      model: "gpt-6-luna",
      instructions:
        "You write concise, truthful ecommerce copy for small businesses in Rwanda. Never invent specifications, guarantees, certifications, prices, or claims. Return only valid JSON with description, short_description, caption, and tags (array of strings).",
      input: JSON.stringify({
        business: business.name,
        product_name: name,
        category,
        details,
      }),
    });

    const raw = response.output_text?.trim();
    if (!raw) return NextResponse.json({ error: "AI returned no content." }, { status: 502 });

    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON." }, { status: 502 });
    }
  } catch (error) {
    console.error("Product AI error:", error);
    return NextResponse.json({ error: "Unable to generate product copy right now." }, { status: 500 });
  }
}
