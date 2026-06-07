"use client";
import { useState } from "react";
import { useCollection } from "../../context/CollectionContext";

const DRIVER_CARDS = [
  { name: "Alex Albon", image: "/drivers/albon_signature.png" },
  { name: "Fernando Alonso", image: "/drivers/alonso_signature.png" },
  { name: "Kimi Antonelli", image: "/drivers/antonelli_signature.png" },
  { name: "Oliver Bearman", image: "/drivers/bearman_signature.png" },
  { name: "Gabriel Bortoleto", image: "/drivers/bortoleto_signature.png" },
  { name: "Valtteri Bottas", image: "/drivers/bottas_signature.png" },
  { name: "Franco Colapinto", image: "/drivers/colapinto_signature.png" },
  { name: "Pierre Gasly", image: "/drivers/gasly_signature.png" },
  { name: "Isack Hadjar", image: "/drivers/hadjar_signature.png" },
  { name: "Lewis Hamilton", image: "/drivers/hamilton_signature.png" },
  { name: "Nico Hulkenberg", image: "/drivers/hulkenberg_signature.png" },
  { name: "Sergio Perez", image: "/drivers/checo_signature.png" },
  { name: "Liam Lawson", image: "/drivers/lawson_signature.png" },
  { name: "Charles Leclerc", image: "/drivers/leclerc_signature.png" },
  { name: "Arvid Lindblad", image: "/drivers/lindblad_signature.png" },
  { name: "Lando Norris", image: "/drivers/norris_signature.png" },
  { name: "Esteban Ocon", image: "/drivers/ocon_signature.png" },
  { name: "Oscar Piastri", image: "/drivers/piastri_signature.png" },
  { name: "George Russell", image: "/drivers/russel_signature.png" },
  { name: "Carlos Sainz", image: "/drivers/sainz_signature.png" },
  { name: "Lance Stroll", image: "/drivers/stroll_signature.png" },
  { name: "Max Verstappen", image: "/drivers/verstappen_signature.png" }
];

export default function PackOpener() {
  const { addToCollection } = useCollection();
  const [isOpening, setIsOpening] = useState(false);
  const [card, setCard] = useState<{ name: string; image: string } | null>(null);

  const openPack = () => {
    setIsOpening(true);
    setCard(null);

    setTimeout(() => {
      const randomDriver = DRIVER_CARDS[Math.floor(Math.random() * DRIVER_CARDS.length)];
      setCard(randomDriver);
      addToCollection(randomDriver); 
      setIsOpening(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {!card && !isOpening && (
        <button onClick={openPack} className="navbar-logo text-lg px-8 py-4 transition-transform hover:scale-105">
          OPEN PACK
        </button>
      )}

      {isOpening && <div className="text-white font-mono text-xl animate-pulse">OPENING PACK...</div>}

      {card && (
        <div className="w-64 aspect-[2/3] animate-in zoom-in duration-300">
          <img src={card.image} alt={card.name} className="w-full h-full object-contain rounded-lg shadow-2xl" />
          <button onClick={() => setCard(null)} className="mt-4 w-full py-2 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors rounded uppercase">
            Close
          </button>
        </div>
      )}
    </div>
  );
}