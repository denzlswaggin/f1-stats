"use client";
import { useCollection } from "../../context/CollectionContext";
import Link from "next/link";

export default function CollectionPage() {
  const { collection, coins } = useCollection();

  // Count duplicates
  const driverCounts = collection.reduce((acc, card) => {
    acc[card.driverId] = (acc[card.driverId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Unique drivers for display
  const uniqueDrivers = collection.filter(
    (card, idx, arr) => arr.findIndex((c) => c.driverId === card.driverId) === idx
  );

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Collection ({uniqueDrivers.length}/22 drivers · {collection.length} cards)</h1>
        <Link
          href="/packs"
          className="navbar-logo"
          style={{ fontSize: "10px", padding: "6px 12px", textDecoration: "none" }}
        >
          🪙 {coins} · OPEN PACKS
        </Link>
      </div>

      {collection.length === 0 ? (
        <div className="coming-soon">
          <div className="coming-soon-icon">🃏</div>
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
            <div key={card.driverId} className="collection-card">
              <img src={card.image} alt={card.name} className="collection-card-image" />
              {driverCounts[card.driverId] > 1 && (
                <div className="collection-card-badge">
                  <span className="collection-card-count">×{driverCounts[card.driverId]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}