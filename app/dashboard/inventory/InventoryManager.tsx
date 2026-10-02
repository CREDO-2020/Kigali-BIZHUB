"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Search, Plus, Minus} from "lucide-react";

type Product={id:string;name:string;sku:string|null;stock:number;low_stock_threshold:number;image_url:string|null};

export default function InventoryManager({businessId,products:initial}:{businessId:string;products:Product[]}){
 const supabase=createClient(); const [products,setProducts]=useState(initial); const [q,setQ]=useState(""); const [busy,setBusy]=useState<string|null>(null);
 const adjust=async(product:Product,delta:number)=>{
   if(product.stock+delta<0)return;
   setBusy(product.id);
   const {error}=await supabase.from("products").update({stock:product.stock+delta}).eq("id",product.id);
   if(!error){
     await supabase.from("inventory_transactions").insert({business_id:businessId,product_id:product.id,quantity_change:delta,reason:delta>0?"stock_in":"stock_out",note:"Manual inventory adjustment"});
     setProducts(prev=>prev.map(p=>p.id===product.id?{...p,stock:p.stock+delta}:p));
   }
   setBusy(null);
 };
 const filtered=products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||(p.sku??"").toLowerCase().includes(q.toLowerCase()));
 return <div className="productsPage"><div className="panel toolbar"><div className="searchBox"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products or SKU..."/></div></div><div className="panel"><div className="panelHead"><div><b>Stock levels</b><small>Stock changes are recorded in inventory history.</small></div></div><div className="tableWrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Level</th><th>Adjust</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="productCell">{p.image_url?<img src={p.image_url} alt=""/>:<div className="productPlaceholder"><span>—</span></div>}<div><b>{p.name}</b><small>{p.sku||"No SKU"}</small></div></div></td><td><b>{p.stock}</b></td><td><span className={p.stock===0?"stockOut":p.stock<=p.low_stock_threshold?"stockLow":"stockGood"}>{p.stock===0?"Out of stock":p.stock<=p.low_stock_threshold?"Low stock":"In stock"}</span></td><td><div className="stockControls"><button disabled={busy===p.id||p.stock===0} onClick={()=>adjust(p,-1)}><Minus size={15}/></button><button disabled={busy===p.id} onClick={()=>adjust(p,1)}><Plus size={15}/></button></div></td></tr>)}</tbody></table></div></div></div>
}
