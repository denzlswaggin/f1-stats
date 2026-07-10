"use client";
import { useCollection } from "../../context/CollectionContext";
import Link from "next/link";
import { useState } from "react";
import { sellCard } from "@/app/actions/points";
import Image from "next/image";
import WavesBackground from "../components/WavesBackground";
import "../(auth)/auth.css";

const getSellPrice = (rarity: string) => {
  if (rarity === "legendary") return 250;
  if (rarity === "epic") return 100;
  if (rarity === "rare") return 50;
  return 25;
};

const rarityOrder: Record<string, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

export default function CollectionPage() {
  const { collection, coins, isLoggedIn, refreshCollection, refreshCoins } = useCollection();
  const [sellingId, setSellingId] = useState<string | null>(null);

  const handleSell = async (driverId: string) => {
    if (sellingId) return;
    setSellingId(driverId);

    const result = await sellCard(driverId);
    if (result.success) {
      await refreshCollection();
      await refreshCoins();
      window.dispatchEvent(new CustomEvent("coins-updated"));
    } else {
      alert(result.error || "Failed to sell card");
    }

    setSellingId(null);
  };

  // Count duplicates
  const driverCounts = collection.reduce((acc, card) => {
    acc[card.driverId] = (acc[card.driverId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);



  // Unique drivers for display
  const uniqueDrivers = collection
    .filter((card, idx, arr) => arr.findIndex((c) => c.driverId === card.driverId) === idx)
    .sort((a, b) => {
      const orderA = rarityOrder[a.rarity] || 0;
      const orderB = rarityOrder[b.rarity] || 0;
      if (orderA !== orderB) {
        return orderB - orderA; // Descending (legendary first)
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="main-content">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Collection {isLoggedIn && `(${uniqueDrivers.length}/22 drivers · ${collection.length} cards)`}</h1>
        {isLoggedIn && (
          <Link
            href="/packs"
            className="navbar-logo"
            style={{ fontSize: "12px", padding: "6px 12px", textDecoration: "none" }}
          >
            BACK TO PACKS
          </Link>
        )}
      </div>

      {!isLoggedIn ? (
        <div className="auth-container" style={{ minHeight: 'auto', padding: '60px 20px' }}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-header" style={{ marginBottom: '24px' }}>
              <h2 className="auth-title">Your Collection is Locked</h2>
              <p className="auth-subtitle" style={{ marginTop: '12px' }}>
                Sign in to collect, view, and manage your exclusive F1 driver cards.
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
      ) : collection.length === 0 ? (
        <div className="coming-soon">

          <h2>No cards yet</h2>
          <p>Open packs to start building your F1 driver collection!</p>
          <Link
            href="/packs"
            className="navbar-logo"
            style={{ marginTop: "16px", fontSize: "12px", padding: "8px 20px", textDecoration: "none" }}
          >
            GO TO PACKS
          </Link>
        </div>
      ) : (
        <div className="collection-grid">
          {uniqueDrivers.map((card) => (
            <div key={card.driverId} className="collection-card group">
              <Image width={500} height={500} src={card.image} alt={card.name} className={`collection-card-image rarity-${card.rarity}`} />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px] z-10">
                <button
                  className="sell-btn"
                  onClick={() => handleSell(card.driverId)}
                  disabled={sellingId === card.driverId}
                >
                  {sellingId === card.driverId ? "SELLING..." : <>SELL FOR {getSellPrice(card.rarity)} <Image src="/coin.svg" alt="Coin" width={14} height={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></>}
                </button>
              </div>

              {driverCounts[card.driverId] > 1 && (
                <div className="collection-card-badge z-20">
                  <span className="collection-card-count">×{driverCounts[card.driverId]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}