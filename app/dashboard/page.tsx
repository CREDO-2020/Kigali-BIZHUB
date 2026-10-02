import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BarChart3, Bot, Boxes, ChevronRight, CircleHelp, LayoutDashboard, Package, Settings, ShoppingCart, Store, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

const nav = [["Overview", LayoutDashboard, "/dashboard"],["Products", Package, "/dashboard/products"],["Inventory", Boxes, "/dashboard/inventory"],["Orders", ShoppingCart, "/dashboard"],["Customers", Users, "/dashboard"],["AI Assistant", Bot, "/dashboard"],["Analytics", BarChart3, "/dashboard"],["Settings", Settings, "/dashboard"]] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub;
  const { data: userData } = await supabase.auth.getUser();
  const { data: business } = await supabase.from("businesses").select("id,name,slug,phone,country,currency").eq("owner_id", userId).maybeSingle();

  if (!business) redirect("/onboarding");

  const { count: productCount } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", business.id);
  const { count: customerCount } = await supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", business.id);
  const { count: orderCount } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("business_id", business.id);
  const displayName = userData.user?.user_metadata?.full_name || "Business Owner";

  return <main className="dashboard">
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brandMark">K</span><span>Kigali <b>BIZHUB</b></span></Link>
      <div className="storeMini"><div className="storeIcon"><Store size={17}/></div><div><b>{business.name}</b><small>Free plan</small></div><ChevronRight size={15}/></div>
      <nav>{nav.map(([label,Icon,href],i)=><Link className={i===0?"active":""} href={href} key={label}><Icon size={17}/>{label}</Link>)}</nav>
      <div className="sidebarBottom"><a href="#"><CircleHelp size={17}/> Help center</a><div className="profile"><div className="avatar">{displayName.charAt(0).toUpperCase()}</div><div><b>{displayName}</b><small>{userData.user?.email}</small></div></div><SignOutButton /></div>
    </aside>
    <section className="dashMain">
      <header className="dashHeader"><div><small>{business.country} · {business.currency}</small><h1>Good morning 👋</h1></div><Link href="/" className="viewStore"><Store size={16}/> View store <ArrowUpRight size={15}/></Link></header>
      <div className="setup"><div><span className="setupTag">YOUR WORKSPACE</span><h2>{business.name} is connected.</h2><p>Add products next, then we will turn them into your public online store.</p></div><Link href="/dashboard/products#add-product" className="primaryButton">Add first product <ArrowUpRight size={16}/></Link></div>
      <div className="metricGrid">{[["Revenue","0 RWF","+0%"],["Orders",String(orderCount ?? 0),"+0%"],["Customers",String(customerCount ?? 0),"+0%"],["Products",String(productCount ?? 0),"+0%"]].map(([a,b,c])=><div className="metric" key={a}><small>{a}</small><strong>{b}</strong><em>{c}</em></div>)}</div>
      <div className="dashGrid"><div className="panel sales"><div className="panelHead"><div><b>Sales overview</b><small>Your revenue will appear here</small></div><select><option>Last 30 days</option></select></div><div className="emptyChart"><BarChart3 size={30}/><b>No sales yet</b><span>Add products and start selling online.</span></div></div><div className="panel aiPanel"><div className="aiSmall"><Bot size={18}/></div><span className="setupTag">BIZHUB AI</span><h3>Your AI business assistant</h3><p>Ask questions about sales, products, customers and marketing when your business data is connected.</p><button>Try AI assistant <ArrowUpRight size={15}/></button></div></div>
      <div className="panel"><div className="panelHead"><div><b>Quick actions</b><small>Manage the important parts of your store.</small></div></div><div className="quickGrid"><Link href="/dashboard/products#add-product"><Package size={19}/><b>Add product</b><span>Create your first product</span></Link><a href="#"><Store size={19}/><b>Customize store</b><span>Add your business details</span></a><Link href="/dashboard/inventory"><Boxes size={19}/><b>Manage inventory</b><span>Track stock levels</span></Link></div></div>
    </section>
  </main>;
}
