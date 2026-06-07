"use client";
import { useCollection } from "../../context/CollectionContext";

export default function CollectionPage() {
  const { collection } = useCollection();

  return (
    <div className="main-content">
      <h1 className="text-2xl font-bold mb-6">My Collection ({collection.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {collection.map((card: { name: string; image: string }, i: number) => (
          <div key={i} className="aspect-[2/3] rounded-lg overflow-hidden">
            <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}