"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await registerUser(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join F1 Stats Hub to save your preferences.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-label">Name</label>
            <input type="text" id="name" name="name" className="auth-input" placeholder="Charles Leclerc" required />
          </div>

          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Email</label>
            <input type="email" id="email" name="email" className="auth-input" placeholder="charles@ferrari.com" required />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <input type="password" id="password" name="password" className="auth-input" placeholder="••••••••" required />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" className="auth-input" placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login" className="auth-link">Log in here</Link>
        </div>
      </div>
    </div>
  );
}
