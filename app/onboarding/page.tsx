import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub;
  const { data: business } = await supabase.from("businesses").select("id,name,slug").eq("owner_id", userId).maybeSingle();

  if (business) redirect("/dashboard");

  return (
    <main className="authPage">
      <div className="onboardingCard">
        <div className="setupTag">WELCOME TO BIZHUB</div>
        <h1>Your business workspace is ready.</h1>
        <p>Next, create your business profile. This will become the identity behind your public online store.</p>
        <div className="onboardingSteps">
          <div><CheckCircle2 size={18}/><span><b>Account created</b><small>Your secure owner account is ready.</small></span></div>
          <div><CheckCircle2 size={18}/><span><b>Business profile</b><small>Coming next: name, phone, location and store link.</small></span></div>
          <div><CheckCircle2 size={18}/><span><b>Products</b><small>Add products and start building your catalog.</small></span></div>
        </div>
        <Link href="/dashboard" className="primaryButton">Open dashboard <ArrowRight size={16}/></Link>
      </div>
    </main>
  );
}
