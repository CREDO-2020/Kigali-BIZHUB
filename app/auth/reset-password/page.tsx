"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage(){
  const supabase=createClient(); const router=useRouter(); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [ready,setReady]=useState(false);
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setReady(!!data.session))},[supabase]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    if(password.length<6){setError("Password must be at least 6 characters.");return}
    if(password!==confirm){setError("Passwords do not match.");return}
    setLoading(true);const {error}=await supabase.auth.updateUser({password});
    if(error){setError(error.message);setLoading(false);return}
    router.replace("/auth/login?reset=success");
  }
  return <main className="authPage"><div className="authCard"><Link href="/" className="authBrand"><span className="brandMark">K</span>Kigali <b>BIZHUB</b></Link><div className="authIcon"><LockKeyhole size={22}/></div><h1>Choose a new password</h1><p>{ready?"Set a new password for your BIZHUB account.":"Open this page from the password reset email link."}</p>{ready?<form onSubmit={submit} className="authForm"><label>New password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm password<input type="password" minLength={6} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<div className="authError">{error}</div>}<button disabled={loading}>{loading?"Updating...":"Update password"}<ArrowRight size={16}/></button></form>:<div className="authError">Your reset session is missing or expired. Request a new link.</div>}<span className="authSwitch"><Link href="/auth/forgot-password">Request another link</Link></span></div></main>
}
