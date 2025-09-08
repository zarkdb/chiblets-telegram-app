import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateUserChibletsEnergy } from '@/lib/energy-system';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Update energy for all user chiblets
    const updatedChiblets = await updateUserChibletsEnergy(userId);

    // Format response with additional computed fields
    const formattedChiblets = updatedChiblets.map(chiblet => ({
      id: chiblet.id,
      name: chiblet.name || chiblet.species.name,
      level: chiblet.level,
      hp: chiblet.hp,
      maxHp: chiblet.maxHp,
      attack: chiblet.attack,
      defense: chiblet.defense,
      experience: chiblet.experience,
      currentEnergy: chiblet.currentEnergy,
      isActive: chiblet.isActive,
      species: {
        id: chiblet.species.id,
        name: chiblet.species.name,
        type: chiblet.species.type,
        rarity: chiblet.species.rarity,
        description: chiblet.species.description,
      },
      // Calculate power for display
      power: Math.floor((chiblet.hp + chiblet.attack + chiblet.defense) / 3),
      // Energy info
      maxEnergy: getMaxEnergyForRarity(chiblet.species.rarity),
      lastEnergyUpdate: chiblet.lastEnergyUpdate,
      createdAt: chiblet.createdAt,
      updatedAt: chiblet.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      chiblets: formattedChiblets
    });

  } catch (error) {
    console.error('Get chiblets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chiblets' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getMaxEnergyForRarity(rarity: string): number {
  const energyLimits = {
    common: 3,
    rare: 6,
    epic: 8,
    legendary: 12,
  };
  return energyLimits[rarity as keyof typeof energyLimits] || 3;
}
