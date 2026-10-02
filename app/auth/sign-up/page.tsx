"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, business_name: businessName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/onboarding";
      return;
    }

    setMessage("Account created. Check your email to confirm your address, then continue setup.");
    setLoading(false);
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <Link href="/" className="authBrand"><span className="brandMark">K</span>Kigali <b>BIZHUB</b></Link>
        <div className="authIcon"><Store size={22} /></div>
        <h1>Create your business account</h1>
        <p>Start with the free plan. You can upgrade when your business grows.</p>
        <form onSubmit={handleSignUp} className="authForm">
          <label>Your name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></label>
          <label>Business name<input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Mico Fashion" /></label>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" /></label>
          <label>Password<input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
          {error && <div className="authError">{error}</div>}
          {message && <div className="authSuccess">{message}</div>}
          <button disabled={loading}>{loading ? "Creating account..." : "Create account"} <ArrowRight size={16} /></button>
        </form>
        <span className="authSwitch">Already have an account? <Link href="/auth/login">Sign in</Link></span>
      </div>
    </main>
  );
}
