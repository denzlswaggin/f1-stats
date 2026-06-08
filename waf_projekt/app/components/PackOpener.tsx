"use client";
import { useState } from "react";
import { useCollection } from "../../context/CollectionContext";
import { openPack } from "@/app/actions/points";

const PACK_COST = 50;

export default function PackOpener() {
  const { coins, refreshCoins, refreshCollection } = useCollection();
  const [isOpening, setIsOpening] = useState(false);
  const [card, setCard] = useState<{ name: string; image: string; driverId: string; rarity: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAfford = coins >= PACK_COST;

  const handleOpenPack = async () => {
    setIsOpening(true);
    setCard(null);
    setError(null);

    // Small delay for animation feel
    await new Promise((r) => setTimeout(r, 1200));

    const result = await openPack();

    if (result.success && result.card) {
      setCard(result.card);
      // Refresh both coins and collection from DB
      refreshCoins();
      refreshCollection();
      window.dispatchEvent(new CustomEvent("coins-updated"));
    } else {
      setError(result.error || "Something went wrong");
    }

    setIsOpening(false);
  };

  return (
    <div className="pack-opener-container">
      {/* Coin balance display */}
      <div className="pack-balance-display">
        <span className="pack-balance-icon">🪙</span>
        <span className="pack-balance-amount">{coins.toLocaleString()}</span>
        <span className="pack-balance-label">F1 COINS</span>
      </div>

      {/* Pack card */}
      {!card && !isOpening && (
        <div className="pack-card-wrapper">
          <div className="pack-card">
            <div className="pack-card-glow" />
            <div className="pack-card-inner">
              <div className="pack-card-logo">F1</div>
              <div className="pack-card-title">SIGNATURE PACK</div>
              <div className="pack-card-subtitle">1 random driver card</div>
            </div>
          </div>

          <button
            onClick={handleOpenPack}
            disabled={!canAfford}
            className={`pack-open-btn${!canAfford ? " disabled" : ""}`}
            id="open-pack-btn"
          >
            {canAfford ? (
              <>OPEN PACK <span className="pack-cost">🪙 {PACK_COST}</span></>
            ) : (
              <>NOT ENOUGH COINS <span className="pack-cost">🪙 {PACK_COST}</span></>
            )}
          </button>
        </div>
      )}

      {/* Opening animation */}
      {isOpening && (
        <div className="pack-opening">
          <div className="pack-opening-glow" />
          <div className="pack-opening-text">OPENING PACK...</div>
        </div>
      )}

      {/* Revealed card */}
      {card && (
        <div className="pack-reveal">
          <div className="pack-revealed-card">
            <img src={card.image} alt={card.name} className={`pack-card-image rarity-${card.rarity}`} />
          </div>
          <button onClick={() => setCard(null)} className="pack-close-btn" id="close-card-btn">
            CLOSE
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="pack-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="pack-close-btn">
            OK
          </button>
        </div>
      )}
    </div>
  );
}