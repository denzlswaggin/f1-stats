"use client";

import { useEffect, useState } from "react";
import { getUserBalance } from "@/app/actions/points";
import Link from "next/link";
import Image from "next/image";

export default function CoinBalance() {
  const [coins, setCoins] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);

  const fetchBalance = async () => {
    const balance = await getUserBalance();
    setCoins((prev) => {
      if (prev !== null && balance !== prev) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 600);
      }
      return balance;
    });
  };

  useEffect(() => {
    fetchBalance();

    // Listen for custom coin-update events from PointsTracker / PackOpener
    const handler = () => fetchBalance();
    window.addEventListener("coins-updated", handler);
    return () => window.removeEventListener("coins-updated", handler);
  }, []);

  if (coins === null) return null;

  return (
    <Link href="/packs" className="coin-balance-badge" id="coin-balance">
      <span className="coin-icon">
        <Image src="/coin.svg" alt="Coin" width={18} height={18} />
      </span>
      <span className={`coin-amount${animate ? " coin-pop" : ""}`}>
        {coins.toLocaleString()}
      </span>
    </Link>
  );
}
