"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const CollectionContext = createContext<any>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collection, setCollection] = useState<{name: string, image: string}[]>([]);

  const addToCollection = (card: { name: string; image: string }) => {
    setCollection((prev) => [...prev, card]);
  };

  return (
    <CollectionContext.Provider value={{ collection, addToCollection }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) return { collection: [], addToCollection: () => {} };
  return context;
};