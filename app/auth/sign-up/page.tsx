"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUSINESS_TYPES = [
  "Retail & Shop",
  "Restaurant & Cafe",
  "Fashion & Beauty",
  "Professional Services",
  "Technology & Electronics",
  "Wholesale & Distribution",
  "Other",
];

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function SignUpPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanBusinessName = businessName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (cleanBusinessName.length < 2) {
      setError("Please enter your business name.");
      return;
    }
    if (!businessType) {
      setError("Please choose your business type.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          business_name: cleanBusinessName,
          business_type: businessType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      const friendly =
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
          ? "An account with this email already exists. Try signing in or resetting your password."
          : error.message;
      setError(friendly);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/onboarding";
      return;
    }

    setMessage(
      "Account created successfully. Check your email and confirm your address to continue setting up your BIZHUB workspace."
    );
    setLoading(false);
  }

  return (
    <main className="authPage">
      <div className="authCard signupCard">
        <Link href="/" className="authBrand">
          <span className="brandMark">K</span>Kigali <b>BIZHUB</b>
        </Link>

        <div className="authIcon"><Store size={22} /></div>
        <div className="setupTag">FREE BUSINESS WORKSPACE</div>
        <h1>Create your BIZHUB account</h1>
        <p>Manage products, inventory, customers, orders, payments and AI tools from one workspace.</p>

        <form onSubmit={handleSignUp} className="authForm">
          <div className="formGrid">
            <label>
              Your name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </label>

            <label>
              Business name
              <input
                required
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Mico Fashion"
              />
            </label>
          </div>

          <label>
            Business type
            <select
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="authSelect"
            >
              <option value="">Choose your business type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Business email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <div className="formGrid">
            <label>
              Password
              <div className="passwordField">
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  className="passwordToggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label>
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                minLength={8}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
              />
            </label>
          </div>

          {password.length > 0 && (
            <div className="passwordMeter">
              <div className="passwordBars">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <span key={bar} className={bar <= score ? "filled" : ""} />
                ))}
              </div>
              <small>
                {score <= 2 ? "Use uppercase, lowercase, numbers and symbols for a stronger password." : "Strong password"}
              </small>
            </div>
          )}

          {!passwordsMatch && <div className="authError">Passwords do not match.</div>}
          {error && <div className="authError">{error}</div>}
          {message && <div className="authSuccess">{message}</div>}

          <button disabled={loading || !passwordsMatch}>
            {loading ? "Creating account..." : "Create business account"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="authTrust">
          <ShieldCheck size={15} />
          <span>Your business data is isolated to your workspace with Supabase security policies.</span>
        </div>

        <span className="authSwitch">
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </span>
      </div>
    </main>
  );
}
