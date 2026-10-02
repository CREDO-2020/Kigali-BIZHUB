"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Send, Sparkles } from "lucide-react";

const prompts = [
  "What should I improve in my inventory today?",
  "Give me 3 marketing ideas for my business.",
  "Which products need my attention?",
  "How can I increase repeat customers?",
];

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ask(e?: FormEvent) {
    e?.preventDefault();
    const value = message.trim();
    if (!value || busy) return;
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed.");
      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand"><span className="brandMark">K</span><span>Kigali <b>BIZHUB</b></span></Link>
        <nav>
          <Link href="/dashboard">← Overview</Link>
          <Link href="/dashboard/products">Products</Link>
          <Link href="/dashboard/inventory">Inventory</Link>
          <Link href="/dashboard/ai-assistant" className="active"><Bot size={17}/> AI Assistant</Link>
        </nav>
      </aside>
      <section className="dashMain">
        <header className="dashHeader">
          <div><small>BUSINESS INTELLIGENCE</small><h1>AI Assistant</h1></div>
          <Link href="/dashboard" className="viewStore"><ArrowLeft size={16}/> Dashboard</Link>
        </header>

        <div className="aiWorkspace">
          <div className="panel aiHero">
            <div className="aiHeroIcon"><Bot size={24}/></div>
            <span className="setupTag">BIZHUB AI</span>
            <h2>Your business copilot</h2>
            <p>Ask about your products, inventory, customers, orders, sales activity or marketing. The assistant reads your authenticated business data on the server.</p>
          </div>

          <div className="aiPromptGrid">
            {prompts.map((prompt) => (
              <button key={prompt} onClick={() => setMessage(prompt)}><Sparkles size={15}/><span>{prompt}</span></button>
            ))}
          </div>

          <div className="panel aiChat">
            <div className="aiChatHeader"><div><b>Ask BIZHUB AI</b><small>Business data stays behind your authenticated server request.</small></div></div>
            {answer && <div className="aiAnswer"><div className="aiAvatar"><Bot size={17}/></div><div><b>BIZHUB AI</b><p>{answer}</p></div></div>}
            {error && <div className="authError">{error}</div>}
            <form className="aiComposer" onSubmit={ask}>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask a business question..." rows={3} maxLength={2000}/>
              <button className="primaryButton" disabled={busy || !message.trim()}>{busy ? "Thinking..." : "Ask AI"} <Send size={16}/></button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
