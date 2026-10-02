import { redirect } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InventoryManager from "./InventoryManager";

export default async function InventoryPage(){
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  if(!claimsData?.claims)redirect("/auth/login");
  const {data:business}=await supabase.from("businesses").select("id,name,currency").eq("owner_id",claimsData.claims.sub).maybeSingle();
  if(!business)redirect("/onboarding");
  const {data:products}=await supabase.from("products").select("id,name,sku,stock,low_stock_threshold,image_url").eq("business_id",business.id).order("name");
  return <main className="dashboard"><aside className="sidebar"><Link href="/" className="brand"><span className="brandMark">K</span><span>Kigali <b>BIZHUB</b></span></Link><nav><Link href="/dashboard">Overview</Link><Link href="/dashboard/products">Products</Link><Link className="active" href="/dashboard/inventory">Inventory</Link><Link href="/dashboard">Orders</Link><Link href="/dashboard">Customers</Link><Link href="/dashboard">Analytics</Link></nav></aside><section className="dashMain"><header className="dashHeader"><div><small><Link href="/dashboard">Dashboard</Link> / Inventory</small><h1>Inventory</h1></div><Link href="/dashboard/products" className="primaryButton"><Boxes size={16}/> Manage products</Link></header><InventoryManager businessId={business.id} products={products??[]}/></section></main>
}
