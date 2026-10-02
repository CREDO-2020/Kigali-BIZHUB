import Link from "next/link";
import { ArrowRight, Bot, Check, Globe2, Package, ShoppingBag, Sparkles, Store, Zap } from "lucide-react";

const features = [
  { icon: Store, title: "Your own online store", text: "Create a professional storefront where customers can discover your products and place orders." },
  { icon: Package, title: "Products & inventory", text: "Track products, prices and stock from one simple business dashboard." },
  { icon: ShoppingBag, title: "Orders & customers", text: "Manage orders and build a customer history without spreadsheets." },
  { icon: Bot, title: "AI business assistant", text: "Ask questions about your sales and generate marketing content in seconds." },
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <Link href="/" className="brand"><span className="brandMark">K</span><span>Kigali <b>BIZHUB</b></span></Link>
        <div className="navLinks"><a href="#features">Features</a><a href="#pricing">Pricing</a><Link href="/dashboard" className="navButton">Open Dashboard <ArrowRight size={16} /></Link></div>
      </nav>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow"><Sparkles size={15} /> Built for ambitious African businesses</div>
          <h1>Turn your local business into a <span>digital business.</span></h1>
          <p className="heroText">Kigali BIZHUB gives small businesses a beautiful online store, sales dashboard, inventory tools and an AI assistant — all in one place.</p>
          <div className="heroActions"><Link href="/dashboard" className="primaryButton">Create your business <ArrowRight size={18} /></Link><a href="#features" className="secondaryButton">Explore features</a></div>
          <div className="trust"><Check size={16} /> Start free. Upgrade when your business grows.</div>
        </div>
        <div className="dashboardPreview">
          <div className="previewTop"><div><span className="dot green" /><span className="dot yellow" /><span className="dot red" /></div><span>bizhub.app/dashboard</span></div>
          <div className="previewBody"><div className="previewHeader"><div><small>Good morning 👋</small><h3>Your business at a glance</h3></div><div className="avatar">A</div></div>
            <div className="stats"><div><small>Revenue</small><strong>1.24M RWF</strong><em>+18.4%</em></div><div><small>Orders</small><strong>128</strong><em>+12.1%</em></div><div><small>Customers</small><strong>342</strong><em>+9.6%</em></div></div>
            <div className="chart"><div className="chartLabel"><b>Sales overview</b><span>This month</span></div><div className="bars">{[35,52,44,68,57,78,91,72,86,64,96,82].map((h,i)=><i key={i} style={{height: h+"%"}} />)}</div></div>
          </div>
        </div>
      </section>
      <section id="features" className="section"><div className="sectionHeading"><div className="eyebrow"><Zap size={15} /> Everything in one place</div><h2>Tools that help a small business <span>look bigger.</span></h2></div><div className="featureGrid">{features.map((f) => <article className="featureCard" key={f.title}><div className="iconBox"><f.icon size={21}/></div><h3>{f.title}</h3><p>{f.text}</p></article>)}</div></section>
      <section className="aiSection"><div className="aiCard"><div className="aiOrb"><Bot size={32}/></div><div><div className="eyebrow"><Sparkles size={15}/> BIZHUB AI</div><h2>Your business has a <span>smart assistant.</span></h2><p>Ask “What sold best this week?”, “Write an advert for my new shoes”, or “Which products are running low?” and get answers from your business data.</p></div></div></section>
      <section id="pricing" className="section pricingSection"><div className="sectionHeading"><div className="eyebrow"><Globe2 size={15}/> Simple pricing</div><h2>Start free. Pay when you <span>grow.</span></h2></div><div className="priceCard"><div><small>STARTER</small><div className="price">5,000 <span>RWF / month</span></div><p>For businesses ready to take their sales online.</p></div><ul><li><Check/> Online storefront</li><li><Check/> Products & inventory</li><li><Check/> Orders & customers</li><li><Check/> Sales dashboard</li></ul><Link href="/dashboard" className="primaryButton">Start building <ArrowRight size={18}/></Link></div></section>
      <footer><span>© 2026 Kigali BIZHUB</span><span>Built for Rwanda 🇷🇼 and East Africa</span></footer>
    </main>
  );
}