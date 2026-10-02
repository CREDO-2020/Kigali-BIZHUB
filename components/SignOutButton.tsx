"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return <button className="signOutButton" onClick={signOut}><LogOut size={15}/> Sign out</button>;
}
