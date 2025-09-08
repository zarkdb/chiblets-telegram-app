import { PrismaClient } from '@prisma/client';
import { getEnergyInfo } from './chiblet-utils';

const prisma = new PrismaClient();

/**
 * Calculate energy regenerated since last update
 */
export function calculateEnergyRegen(
  lastEnergyUpdate: Date,
  currentTime: Date = new Date()
): number {
  const minutesPassed = Math.floor((currentTime.getTime() - lastEnergyUpdate.getTime()) / (1000 * 60));
  const energyRegenMinutes = 20; // 20 minutes per energy point
  
  return Math.floor(minutesPassed / energyRegenMinutes);
}

/**
 * Update a single chiblet's energy
 */
export async function updateChibletEnergy(chibletId: string) {
  const chiblet = await prisma.userChiblet.findUnique({
    where: { id: chibletId },
    include: { species: true }
  });

  if (!chiblet) {
    throw new Error('Chiblet not found');
  }

  const energyInfo = getEnergyInfo(chiblet.species.rarity);
  const maxEnergy = energyInfo.maxEnergy;
  
  // If already at max energy, no need to update
  if (!chiblet.currentEnergy || chiblet.currentEnergy >= maxEnergy) {
    return chiblet;
  }

  const now = new Date();
  const lastUpdate = chiblet.lastEnergyUpdate || chiblet.updatedAt;
  const energyToAdd = calculateEnergyRegen(lastUpdate, now);

  if (energyToAdd > 0) {
    const newEnergy = Math.min(
      (chiblet.currentEnergy || 0) + energyToAdd,
      maxEnergy
    );

    const updatedChiblet = await prisma.userChiblet.update({
      where: { id: chibletId },
      data: {
        currentEnergy: newEnergy,
        lastEnergyUpdate: now,
      },
      include: { species: true }
    });

    return updatedChiblet;
  }

  return chiblet;
}

/**
 * Update energy for all of a user's chiblets
 */
export async function updateUserChibletsEnergy(userId: string) {
  const chiblets = await prisma.userChiblet.findMany({
    where: { userId },
    include: { species: true }
  });

  const updatedChiblets = [];
  
  for (const chiblet of chiblets) {
    try {
      const updated = await updateChibletEnergy(chiblet.id);
      updatedChiblets.push(updated);
    } catch (error) {
      console.error(`Failed to update energy for chiblet ${chiblet.id}:`, error);
      updatedChiblets.push(chiblet);
    }
  }

  return updatedChiblets;
}

/**
 * Get time until next energy regeneration for a chiblet
 */
export function getTimeUntilNextEnergy(chiblet: any): {
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  if (!chiblet.lastEnergyUpdate) {
    return { minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const now = new Date();
  const lastUpdate = new Date(chiblet.lastEnergyUpdate);
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  const energyRegenMinutes = 20;
  
  // Time until next energy point
  const minutesUntilNext = energyRegenMinutes - (minutesSinceUpdate % energyRegenMinutes);
  const totalSeconds = Math.ceil(minutesUntilNext * 60);
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes,
    seconds,
    totalSeconds
  };
}
