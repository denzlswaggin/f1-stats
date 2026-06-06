"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import "../auth.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your F1 Stats Hub account.</p>
      </div>

      {registered && !error && (
        <div className="auth-error" style={{ background: 'rgba(0, 200, 83, 0.1)', borderColor: 'rgba(0, 200, 83, 0.3)', color: '#00e676' }}>
          Account created successfully. Please log in.
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">Email</label>
          <input type="email" id="email" name="email" className="auth-input" placeholder="charles@ferrari.com" required />
        </div>

        <div className="auth-form-group">
          <label htmlFor="password" className="auth-label">Password</label>
          <input type="password" id="password" name="password" className="auth-input" placeholder="••••••••" required />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="auth-footer">
        Don&apos;t have an account? <Link href="/register" className="auth-link">Sign up here</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
