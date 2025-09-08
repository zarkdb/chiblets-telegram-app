import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { findPvPOpponent } from '@/lib/battle-system';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chibletId } = body;

    if (!userId || !chibletId) {
      return NextResponse.json(
        { error: 'Missing userId or chibletId' },
        { status: 400 }
      );
    }

    // Get the player's chiblet to check its level and energy
    const playerChiblet = await prisma.userChiblet.findUnique({
      where: { id: chibletId },
      include: { species: true }
    });

    if (!playerChiblet) {
      return NextResponse.json(
        { error: 'Chiblet not found' },
        { status: 404 }
      );
    }

    if (playerChiblet.userId !== userId) {
      return NextResponse.json(
        { error: 'Chiblet does not belong to user' },
        { status: 403 }
      );
    }

    if (!playerChiblet.currentEnergy || playerChiblet.currentEnergy <= 0) {
      return NextResponse.json(
        { error: 'Chiblet has no energy for battle' },
        { status: 400 }
      );
    }

    if (playerChiblet.hp <= 0) {
      return NextResponse.json(
        { error: 'Chiblet is fainted and cannot battle' },
        { status: 400 }
      );
    }

    // Find a suitable opponent
    const opponent = await findPvPOpponent(userId, playerChiblet.level);

    if (!opponent) {
      return NextResponse.json(
        { error: 'No suitable opponents found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      opponent: {
        id: opponent.id,
        name: opponent.name || opponent.species.name,
        level: opponent.level,
        hp: opponent.hp,
        maxHp: opponent.maxHp,
        attack: opponent.attack,
        defense: opponent.defense,
        species: {
          name: opponent.species.name,
          type: opponent.species.type,
          rarity: opponent.species.rarity
        },
        user: {
          displayName: opponent.user.firstName || opponent.user.telegramUsername || `User${opponent.user.id.slice(-4)}`,
          level: opponent.user.level,
          photoUrl: opponent.user.photoUrl
        }
      },
      playerChiblet: {
        id: playerChiblet.id,
        name: playerChiblet.name || playerChiblet.species.name,
        level: playerChiblet.level,
        hp: playerChiblet.hp,
        maxHp: playerChiblet.maxHp,
        attack: playerChiblet.attack,
        defense: playerChiblet.defense,
        currentEnergy: playerChiblet.currentEnergy,
        species: {
          name: playerChiblet.species.name,
          type: playerChiblet.species.type,
          rarity: playerChiblet.species.rarity
        }
      }
    });

  } catch (error) {
    console.error('Find opponent error:', error);
    return NextResponse.json(
      { error: 'Failed to find opponent' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
