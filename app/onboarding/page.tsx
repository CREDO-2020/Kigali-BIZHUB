import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BusinessForm from "./BusinessForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub;
  const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", userId).maybeSingle();
  if (business) redirect("/dashboard");

  const { data: userData } = await supabase.auth.getUser();
  const initialName = userData.user?.user_metadata?.business_name || "";

  return <main className="authPage"><BusinessForm initialName={initialName} /></main>;
}
