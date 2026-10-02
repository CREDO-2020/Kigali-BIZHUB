import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI is not configured on the server." }, { status: 503 });

    const { data: business } = await supabase
      .from("businesses")
      .select("id,name,currency,country,city,district,category")
      .eq("owner_id", userId)
      .maybeSingle();

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const message = String(body.message ?? "").trim();
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
    if (message.length > 2000) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

    const [productsResult, customersResult, ordersResult] = await Promise.all([
      supabase.from("products").select("name,price,stock,status,is_featured,is_popular").eq("business_id", business.id).limit(100),
      supabase.from("customers").select("name,district,created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("orders").select("order_number,status,payment_status,total,created_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(100),
    ]);

    const products = productsResult.data ?? [];
    const customers = customersResult.data ?? [];
    const orders = ordersResult.data ?? [];
    const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const lowStock = products.filter((p) => Number(p.stock ?? 0) <= 5).slice(0, 20);
    const recentOrders = orders.slice(0, 10).map((o) => ({
      number: o.order_number,
      status: o.status,
      payment: o.payment_status,
      total: Number(o.total ?? 0),
      created_at: o.created_at,
    }));

    const context = {
      business,
      metrics: {
        product_count: products.length,
        customer_count: customers.length,
        order_count: orders.length,
        revenue_from_loaded_orders: revenue,
      },
      low_stock: lowStock,
      recent_orders: recentOrders,
      products: products.slice(0, 50),
    };

    const response = await openai.responses.create({
      model: "gpt-6-luna",
      instructions:
        "You are BIZHUB AI, a practical business assistant for small businesses in Rwanda. Use only the supplied business data for business-specific facts. Never invent sales, customers, prices, inventory, regulations, or financial results. If the data is insufficient, say so clearly. Give concise, actionable advice. Use RWF or the supplied business currency. Do not expose private customer contact details or internal IDs. You may suggest marketing, inventory, pricing, customer-service, and operational ideas, but do not present guesses as facts.",
      input: JSON.stringify({
        question: message,
        business_context: context,
      }),
    });

    const answer = response.output_text?.trim();
    if (!answer) return NextResponse.json({ error: "AI returned no answer." }, { status: 502 });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Business AI error:", error);
    return NextResponse.json({ error: "Unable to reach the AI assistant right now." }, { status: 500 });
  }
}
