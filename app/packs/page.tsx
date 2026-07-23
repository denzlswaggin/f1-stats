import type { Metadata } from "next";
import PackOpener from "../components/PackOpener";
import Link from "next/link";
import { auth } from "@/auth";
import WavesBackground from "../components/WavesBackground";
import "../(auth)/auth.css";

export const metadata: Metadata = {
  title: "Card Packs – F1 Stats Hub",
  description: "Manage your F1 driver and team card collection.",
};

export default async function PacksPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Card Packs</h1>
        {isLoggedIn && (
          <Link 
            href="/collection" 
            className="navbar-logo" 
            style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
          >
            VIEW COLLECTION
          </Link>
        )}
      </div>
      
      {!isLoggedIn ? (
        <div className="auth-container" style={{ minHeight: 'auto', padding: '60px 20px' }}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <h2 className="auth-title">Unlock Card Packs</h2>
              <p className="auth-subtitle" style={{ marginTop: '12px' }}>
                You need to be signed in to spend your F1 Coins and open driver packs.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
              <Link href="/login" className="auth-button" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                Log In
              </Link>
              <Link href="/register" className="auth-button" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'white', textDecoration: 'none', padding: '12px 24px' }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <PackOpener />
      )}
    </div>
    </>
  );
}