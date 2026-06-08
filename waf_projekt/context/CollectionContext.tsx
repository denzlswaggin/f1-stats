"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getUserCollection, getUserBalance } from "@/app/actions/points";

interface Card {
  id: string;
  driverId: string;
  name: string;
  image: string;
  rarity: string;
  createdAt: Date;
}

interface CollectionContextValue {
  collection: Card[];
  coins: number;
  isLoggedIn: boolean;
  refreshCollection: () => Promise<void>;
  refreshCoins: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({
  children,
  isLoggedIn,
}: {
  children: ReactNode;
  isLoggedIn: boolean;
}) {
  const [collection, setCollection] = useState<Card[]>([]);
  const [coins, setCoins] = useState(0);

  const refreshCollection = useCallback(async () => {
    if (!isLoggedIn) return;
    const cards = await getUserCollection();
    setCollection(cards);
  }, [isLoggedIn]);

  const refreshCoins = useCallback(async () => {
    if (!isLoggedIn) return;
    const balance = await getUserBalance();
    setCoins(balance);
  }, [isLoggedIn]);

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      refreshCollection();
      refreshCoins();
    } else {
      setCollection([]);
      setCoins(0);
    }
  }, [isLoggedIn, refreshCollection, refreshCoins]);

  // Listen for coin updates from PointsTracker
  useEffect(() => {
    const handler = () => refreshCoins();
    window.addEventListener("coins-updated", handler);
    return () => window.removeEventListener("coins-updated", handler);
  }, [refreshCoins]);

  return (
    <CollectionContext.Provider value={{ collection, coins, isLoggedIn, refreshCollection, refreshCoins }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) return { collection: [], coins: 0, isLoggedIn: false, refreshCollection: async () => {}, refreshCoins: async () => {} };
  return context;
};