"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const PACK_COST = 50;
const DAILY_LOGIN_REWARD = 10;
const PAGE_VIEW_REWARD = 5;
const DRIVER_VIEW_REWARD = 3;

const DRIVER_CARDS = [
  { driverId: "albon", name: "Alex Albon", image: "/drivers/albon_signature.png", rarity: "common" },
  { driverId: "alonso", name: "Fernando Alonso", image: "/drivers/alonso_signature.png", rarity: "common" },
  { driverId: "antonelli", name: "Kimi Antonelli", image: "/drivers/antonelli_signature.png", rarity: "legendary" },
  { driverId: "bearman", name: "Oliver Bearman", image: "/drivers/bearman_signature.png", rarity: "rare" },
  { driverId: "bortoleto", name: "Gabriel Bortoleto", image: "/drivers/bortoleto_signature.png", rarity: "common" },
  { driverId: "bottas", name: "Valtteri Bottas", image: "/drivers/bottas_signature.png", rarity: "common" },
  { driverId: "colapinto", name: "Franco Colapinto", image: "/drivers/colapinto_signature.png", rarity: "rare" },
  { driverId: "gasly", name: "Pierre Gasly", image: "/drivers/gasly_signature.png", rarity: "rare" },
  { driverId: "hadjar", name: "Isack Hadjar", image: "/drivers/hadjar_signature.png", rarity: "rare" },
  { driverId: "hamilton", name: "Lewis Hamilton", image: "/drivers/hamilton_signature.png", rarity: "epic" },
  { driverId: "hulkenberg", name: "Nico Hulkenberg", image: "/drivers/hulkenberg_signature.png", rarity: "common" },
  { driverId: "perez", name: "Sergio Perez", image: "/drivers/checo_signature.png", rarity: "common" },
  { driverId: "lawson", name: "Liam Lawson", image: "/drivers/lawson_signature.png", rarity: "rare" },
  { driverId: "leclerc", name: "Charles Leclerc", image: "/drivers/leclerc_signature.png", rarity: "epic" },
  { driverId: "lindblad", name: "Arvid Lindblad", image: "/drivers/lindblad_signature.png", rarity: "common" },
  { driverId: "norris", name: "Lando Norris", image: "/drivers/norris_signature.png", rarity: "epic" },
  { driverId: "ocon", name: "Esteban Ocon", image: "/drivers/ocon_signature.png", rarity: "common" },
  { driverId: "piastri", name: "Oscar Piastri", image: "/drivers/piastri_signature.png", rarity: "epic" },
  { driverId: "russell", name: "George Russell", image: "/drivers/russel_signature.png", rarity: "epic" },
  { driverId: "sainz", name: "Carlos Sainz", image: "/drivers/sainz_signature.png", rarity: "common" },
  { driverId: "stroll", name: "Lance Stroll", image: "/drivers/stroll_signature.png", rarity: "common" },
  { driverId: "verstappen", name: "Max Verstappen", image: "/drivers/verstappen_signature.png", rarity: "epic" },
];


async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Check if a reward was already claimed today for the given reason */
async function hasClaimedToday(userId: string, reason: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await prisma.pointsLog.findFirst({
    where: {
      userId,
      reason,
      createdAt: { gte: startOfDay },
    },
  });

  return !!existing;
}

/** Award coins to user + log the transaction */
async function awardCoins(userId: string, amount: number, reason: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (user?.isAdmin) return; // Admins have infinite coins

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: amount } },
    }),
    prisma.pointsLog.create({
      data: { userId, amount, reason },
    }),
  ]);
}


export async function getUserBalance(): Promise<number> {
  const userId = await getAuthUserId();
  if (!userId) return 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true, isAdmin: true },
  });

  if (user?.isAdmin) return 999999999;
  return user?.coins ?? 0;
}

export async function getUserCollection() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const cards = await prisma.collectedCard.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Dynamically map rarity so old cards are updated
  return cards.map((card) => {
    const driverDef = DRIVER_CARDS.find((d) => d.driverId === card.driverId);
    if (driverDef) {
      card.rarity = driverDef.rarity;
    }
    return card;
  });
}

export async function claimDailyLogin(): Promise<{ awarded: boolean; amount: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { awarded: false, amount: 0 };

  if (await hasClaimedToday(userId, "daily_login")) {
    return { awarded: false, amount: 0 };
  }

  await awardCoins(userId, DAILY_LOGIN_REWARD, "daily_login");
  return { awarded: true, amount: DAILY_LOGIN_REWARD };
}

export async function claimPageView(
  page: string
): Promise<{ awarded: boolean; amount: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { awarded: false, amount: 0 };

  // Sanitize: only allow known page names
  const allowedPages = ["results", "driver-standings", "constructor-standings", "schedule", "compare"];
  if (!allowedPages.includes(page)) return { awarded: false, amount: 0 };

  const reason = `view_${page}`;

  if (await hasClaimedToday(userId, reason)) {
    return { awarded: false, amount: 0 };
  }

  await awardCoins(userId, PAGE_VIEW_REWARD, reason);
  return { awarded: true, amount: PAGE_VIEW_REWARD };
}

export async function claimDriverView(
  driverId: string
): Promise<{ awarded: boolean; amount: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { awarded: false, amount: 0 };

  const reason = `view_driver_${driverId}`;

  if (await hasClaimedToday(userId, reason)) {
    return { awarded: false, amount: 0 };
  }

  await awardCoins(userId, DRIVER_VIEW_REWARD, reason);
  return { awarded: true, amount: DRIVER_VIEW_REWARD };
}

export async function openPack(): Promise<{
  success: boolean;
  card?: { name: string; image: string; driverId: string; rarity: string };
  error?: string;
  newBalance?: number;
}> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  // Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true, isAdmin: true },
  });

  if (!user || (!user.isAdmin && user.coins < PACK_COST)) {
    return { success: false, error: "Not enough coins" };
  }

  // Roll for rarity based on weighted probabilities
  const roll = Math.random() * 100;
  let selectedRarity = "common";

  if (roll < 2) {
    selectedRarity = "legendary"; // 2% chance
  } else if (roll < 10) {
    selectedRarity = "epic";      // 8% chance (2% - 10%)
  } else if (roll < 35) {
    selectedRarity = "rare";      // 25% chance (10% - 35%)
  } else {
    selectedRarity = "common";    // 65% chance (35% - 100%)
  }

  // Filter pool by selected rarity
  const pool = DRIVER_CARDS.filter(d => d.rarity === selectedRarity);
  const randomDriver = pool[Math.floor(Math.random() * pool.length)];

  // Create transactions
  const transactions: any[] = [];

  if (!user.isAdmin) {
    transactions.push(
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: PACK_COST } },
      })
    );
    transactions.push(
      prisma.pointsLog.create({
        data: { userId, amount: -PACK_COST, reason: "open_pack" },
      })
    );
  }

  transactions.push(
    prisma.collectedCard.create({
      data: {
        userId,
        driverId: randomDriver.driverId,
        name: randomDriver.name,
        image: randomDriver.image,
        rarity: randomDriver.rarity,
      },
    })
  );

  await prisma.$transaction(transactions);

  return {
    success: true,
    card: randomDriver,
    newBalance: user.isAdmin ? 999999999 : user.coins - PACK_COST,
  };
}

export async function getPointsHistory(limit = 20) {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.pointsLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function sellCard(driverId: string): Promise<{ success: boolean; error?: string; coinsEarned?: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  // Find one card of this driver owned by the user
  const card = await prisma.collectedCard.findFirst({
    where: { userId, driverId },
  });

  if (!card) {
    return { success: false, error: "Card not found in your collection" };
  }

  // Determine sell price based on correct rarity
  const driverDef = DRIVER_CARDS.find((d) => d.driverId === card.driverId);
  const effectiveRarity = driverDef?.rarity || card.rarity;

  let sellPrice = 25;
  if (effectiveRarity === "rare") sellPrice = 50;
  if (effectiveRarity === "epic") sellPrice = 100;
  if (effectiveRarity === "legendary") sellPrice = 250;

  // Transaction: Delete card and award coins
  const transactions: any[] = [
    prisma.collectedCard.delete({
      where: { id: card.id },
    })
  ];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    transactions.push(
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: sellPrice } },
      })
    );
    transactions.push(
      prisma.pointsLog.create({
        data: { userId, amount: sellPrice, reason: "sell_card" },
      })
    );
  }

  await prisma.$transaction(transactions);

  return { success: true, coinsEarned: sellPrice };
}
