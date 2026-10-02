"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage(){
  const supabase=createClient(); const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setLoading(true);setError("");setMessage("");
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback?next=/auth/reset-password`});
    if(error)setError(error.message);else setMessage("If an account exists for that email, we sent a password reset link.");
    setLoading(false);
  }
  return <main className="authPage"><div className="authCard"><Link href="/" className="authBrand"><span className="brandMark">K</span>Kigali <b>BIZHUB</b></Link><div className="authIcon"><Mail size={22}/></div><h1>Reset your password</h1><p>Enter your account email and we will send you a secure reset link.</p><form onSubmit={submit} className="authForm"><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@business.com"/></label>{error&&<div className="authError">{error}</div>}{message&&<div className="authSuccess">{message}</div>}<button disabled={loading}>{loading?"Sending...":"Send reset link"}<ArrowRight size={16}/></button></form><span className="authSwitch"><Link href="/auth/login">Back to sign in</Link></span></div></main>
}
