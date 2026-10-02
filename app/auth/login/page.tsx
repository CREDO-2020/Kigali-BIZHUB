"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <Link href="/" className="authBrand"><span className="brandMark">K</span>Kigali <b>BIZHUB</b></Link>
        <div className="authIcon"><LockKeyhole size={22} /></div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your business, products and orders.</p>
        <form onSubmit={handleLogin} className="authForm">
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" /></label>
          <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /><Link href="/auth/forgot-password" className="authForgot">Forgot password?</Link></label>
          {error && <div className="authError">{error}</div>}
          <button disabled={loading}>{loading ? "Signing in..." : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <span className="authSwitch">New to BIZHUB? <Link href="/auth/sign-up">Create a business account</Link></span>
      </div>
    </main>
  );
}
