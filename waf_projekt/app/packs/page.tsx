import type { Metadata } from "next";
import PackOpener from "../components/PackOpener";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Card Packs – F1 Stats Hub",
  description: "Manage your F1 driver and team card collection.",
};

export default function PacksPage() {
  return (
    <div className="main-content">
      {}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Card Packs</h1>
        
        <Link 
          href="/collection" 
          className="navbar-logo" 
          style={{ fontSize: '10px', padding: '6px 12px', textDecoration: 'none' }}
        >
          VIEW COLLECTION
        </Link>
      </div>
      
      <PackOpener />
    </div>
  );
}