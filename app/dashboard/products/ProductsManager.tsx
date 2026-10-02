"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ImagePlus, Pencil, Search, Trash2, X } from "lucide-react";

type Product = {
  id:string; name:string; slug:string; description:string|null; price:number; compare_at_price:number|null;
  cost_price:number|null; sku:string|null; barcode:string|null; brand:string|null; stock:number;
  low_stock_threshold:number; image_url:string|null; status:"active"|"draft"|"archived";
  is_featured:boolean; is_popular:boolean; is_new:boolean; category_id:string|null;
};
type Category = {id:string; name:string; slug:string; image_url:string|null; sort_order:number};

function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)}

export default function ProductsManager({businessId,currency,initialProducts,initialCategories}:{businessId:string;currency:string;initialProducts:Product[];initialCategories:Category[]}){
  const supabase=createClient();
  const [products,setProducts]=useState(initialProducts);
  const [categories,setCategories]=useState(initialCategories);
  const [query,setQuery]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [showCategory,setShowCategory]=useState(false);
  const [editing,setEditing]=useState<Product|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  const filtered=useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()) || (p.sku??"").toLowerCase().includes(query.toLowerCase())),[products,query]);

  async function saveProduct(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setError("");
    const form=new FormData(e.currentTarget);
    const name=String(form.get("name")||"").trim();
    const price=Number(form.get("price")||0);
    const stock=Number(form.get("stock")||0);
    if(!name || price<0 || stock<0){setError("Enter a valid product name, price and stock.");setBusy(false);return}
    const payload={
      business_id:businessId,name,slug:slugify(name),description:String(form.get("description")||"")||null,
      short_description:String(form.get("short_description")||"")||null,price,
      compare_at_price:form.get("compare_at_price")?Number(form.get("compare_at_price")):null,
      cost_price:form.get("cost_price")?Number(form.get("cost_price")):null,
      sku:String(form.get("sku")||"")||null,barcode:String(form.get("barcode")||"")||null,brand:String(form.get("brand")||"")||null,
      stock,low_stock_threshold:Number(form.get("low_stock_threshold")||5),category_id:String(form.get("category_id")||"")||null,
      status:String(form.get("status")||"active"),is_featured:form.get("is_featured")==="on",is_popular:form.get("is_popular")==="on",
      is_new:form.get("is_new")==="on",
    };
    let result;
    if(editing) result=await supabase.from("products").update(payload).eq("id",editing.id).select().single();
    else result=await supabase.from("products").insert(payload).select().single();
    if(result.error){setError(result.error.message.includes("PRODUCT_LIMIT_REACHED")?"You've reached your plan's product limit. Upgrade your plan to add more products.":result.error.message);setBusy(false);return}
    const file=form.get("image");
    if(file instanceof File && file.size>0){
      if(file.size>5*1024*1024){setError("Image must be 5MB or smaller.");setBusy(false);return}
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
      const path=`${result.data.id}/${crypto.randomUUID()}.${ext}`;
      const upload=await supabase.storage.from("product-images").upload(path,file,{contentType:file.type,upsert:false});
      if(upload.error){setError(upload.error.message);setBusy(false);return}
      const publicUrl=supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      const imageUpdate=await supabase.from("products").update({image_url:publicUrl}).eq("id",result.data.id).select().single();
      if(imageUpdate.error){setError(imageUpdate.error.message);setBusy(false);return}
      result={...result,data:imageUpdate.data};
    }
    if(editing)setProducts(prev=>prev.map(p=>p.id===editing.id?result.data:p)); else setProducts(prev=>[result.data,...prev]);
    setShowForm(false);setEditing(null);e.currentTarget.reset();setBusy(false);
  }

  async function removeProduct(id:string){
    if(!confirm("Delete this product? This cannot be undone."))return;
    const {error}=await supabase.from("products").delete().eq("id",id);
    if(error){setError(error.message);return}
    setProducts(prev=>prev.filter(p=>p.id!==id));
  }

  async function addCategory(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setError("");
    const form=new FormData(e.currentTarget);const name=String(form.get("name")||"").trim();
    if(!name){setBusy(false);return}
    const {data,error}=await supabase.from("categories").insert({business_id:businessId,name,slug:slugify(name),sort_order:categories.length}).select().single();
    if(error)setError(error.message);else{setCategories(prev=>[...prev,data]);setShowCategory(false);e.currentTarget.reset()}
    setBusy(false);
  }

  return <div className="productsPage">
    <div className="panel toolbar"><div className="searchBox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products or SKU..." /></div><button className="secondaryButton" onClick={()=>setShowCategory(true)}>Manage categories</button></div>
    {error&&<div className="authError">{error}</div>}
    <div className="panel productTable">
      <div className="panelHead"><div><b>{filtered.length} product{filtered.length===1?"":"s"}</b><small>Manage your catalog, pricing and stock.</small></div></div>
      {filtered.length===0?<div className="emptyState"><Package size={28}/><b>No products yet</b><span>Add your first product to start building your storefront.</span><button className="primaryButton" onClick={()=>{setEditing(null);setShowForm(true)}}>Add product</button></div>:
      <div className="tableWrap"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="productCell">{p.image_url?<img src={p.image_url} alt="" />:<div className="productPlaceholder"><ImagePlus size={18}/></div>}<div><b>{p.name}</b><small>{p.sku||"No SKU"}</small></div></div></td><td>{currency} {Number(p.price).toLocaleString()}</td><td><span className={p.stock===0?"stockOut":p.stock<=p.low_stock_threshold?"stockLow":"stockGood"}>{p.stock}</span></td><td><span className="statusBadge">{p.status}</span></td><td><div className="rowActions"><button onClick={()=>{setEditing(p);setShowForm(true)}} aria-label="Edit"><Pencil size={16}/></button><button onClick={()=>removeProduct(p.id)} aria-label="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
    </div>

    {showForm&&<div className="modalBackdrop"><div className="modalCard"><div className="modalHead"><div><b>{editing?"Edit product":"Add product"}</b><small>Product information and inventory</small></div><button onClick={()=>{setShowForm(false);setEditing(null)}}><X size={18}/></button></div>
      <form onSubmit={saveProduct} className="productForm" id="add-product">
        <div className="formGrid"><label>Name<input name="name" required defaultValue={editing?.name||""}/></label><label>Price ({currency})<input name="price" type="number" min="0" step="0.01" required defaultValue={editing?.price??0}/></label><label>Compare-at price<input name="compare_at_price" type="number" min="0" step="0.01" defaultValue={editing?.compare_at_price??""}/></label><label>Cost price<input name="cost_price" type="number" min="0" step="0.01" defaultValue={editing?.cost_price??""}/></label><label>SKU<input name="sku" defaultValue={editing?.sku||""}/></label><label>Barcode<input name="barcode" defaultValue={editing?.barcode||""}/></label><label>Brand<input name="brand" defaultValue={editing?.brand||""}/></label><label>Category<select name="category_id" defaultValue={editing?.category_id||""}><option value="">No category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Stock<input name="stock" type="number" min="0" required defaultValue={editing?.stock??0}/></label><label>Low-stock alert<input name="low_stock_threshold" type="number" min="0" defaultValue={editing?.low_stock_threshold??5}/></label><label>Status<select name="status" defaultValue={editing?.status||"active"}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label><label>Product image<input name="image" type="file" accept="image/png,image/jpeg,image/webp"/></label></div>
        <label>Description<textarea name="description" rows={4} defaultValue={editing?.description||""}/></label><label>Short description<textarea name="short_description" rows={2} defaultValue=""/></label>
        <div className="checkGrid"><label><input name="is_featured" type="checkbox" defaultChecked={editing?.is_featured}/> Featured</label><label><input name="is_popular" type="checkbox" defaultChecked={editing?.is_popular}/> Popular</label><label><input name="is_new" type="checkbox" defaultChecked={editing?.is_new??true}/> New</label></div>
        <button className="primaryButton" disabled={busy}>{busy?"Saving...":editing?"Save changes":"Create product"}</button>
      </form>
    </div></div>}

    {showCategory&&<div className="modalBackdrop"><div className="modalCard small"><div className="modalHead"><div><b>Categories</b><small>Organize your catalog.</small></div><button onClick={()=>setShowCategory(false)}><X size={18}/></button></div><div className="categoryList">{categories.map(c=><div key={c.id}><span>{c.name}</span><small>{c.slug}</small></div>)}</div><form onSubmit={addCategory} className="inlineForm"><input name="name" required placeholder="New category name"/><button className="primaryButton" disabled={busy}>Add</button></form></div></div>}
  </div>
}
