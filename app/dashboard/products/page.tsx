import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Plus, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductsManager from "./ProductsManager";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub;
  const { data: business } = await supabase
    .from("businesses")
    .select("id,name,currency")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const [{ data: products }, { data: categories }, { data: subscription }] = await Promise.all([
    supabase.from("products").select("id,name,slug,description,price,compare_at_price,cost_price,sku,barcode,brand,stock,low_stock_threshold,image_url,status,is_featured,is_popular,is_new,category_id,created_at").eq("business_id", business.id).order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name,slug,image_url,sort_order").eq("business_id", business.id).order("sort_order").order("name"),
    supabase.from("subscriptions").select("plan_id,status").eq("business_id", business.id).maybeSingle(),
  ]);

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brandMark">K</span><span>Kigali <b>BIZHUB</b></span></Link>
        <div className="storeMini"><div className="storeIcon"><Package size={17}/></div><div><b>{business.name}</b><small>{subscription?.plan_id ?? "free"} plan</small></div></div>
        <nav>
          <Link href="/dashboard">Overview</Link>
          <Link className="active" href="/dashboard/products">Products</Link>
          <Link href="/dashboard/inventory">Inventory</Link>
          <Link href="/dashboard">Orders</Link>
          <Link href="/dashboard">Customers</Link>
          <Link href="/dashboard">Analytics</Link>
        </nav>
      </aside>
      <section className="dashMain">
        <header className="dashHeader">
          <div><small><Link href="/dashboard">Dashboard</Link> / Products</small><h1>Products</h1></div>
          <Link href="#add-product" className="primaryButton"><Plus size={16}/> Add product</Link>
        </header>
        <ProductsManager businessId={business.id} currency={business.currency} initialProducts={products ?? []} initialCategories={categories ?? []} />
      </section>
    </main>
  );
}
