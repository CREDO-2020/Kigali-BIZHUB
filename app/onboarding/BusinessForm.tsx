"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

export default function BusinessForm({ initialName }: { initialName: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const slug = makeSlug(name);
    if (!slug) {
      setError("Please enter a valid business name.");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      router.replace("/auth/login");
      return;
    }

    const { error: insertError } = await supabase.from("businesses").insert({
      owner_id: userData.user.id,
      name,
      slug,
      description: description || null,
      phone: phone || null,
    });

    if (insertError) {
      setError(insertError.code === "23505" ? "That store link is already taken. Change the business name slightly." : insertError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="onboardingCard">
      <div className="authIcon"><Store size={22} /></div>
      <div className="setupTag">STEP 1 OF 3</div>
      <h1>Create your business profile</h1>
      <p>This information will power your dashboard and later your public storefront.</p>
      <form onSubmit={createBusiness} className="authForm">
        <label>Business name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mico Fashion" /></label>
        <label>Business phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7xx xxx xxx" /></label>
        <label>Short description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your business sell?" rows={4} /></label>
        {error && <div className="authError">{error}</div>}
        <button disabled={loading}>{loading ? "Creating workspace..." : "Create my workspace"} <ArrowRight size={16} /></button>
      </form>
    </div>
  );
}
