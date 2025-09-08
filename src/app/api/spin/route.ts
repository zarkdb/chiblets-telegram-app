import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DAILY_SPIN_LIMIT = 3;

// Define possible spin rewards
const SPIN_REWARDS = [
  { id: 1, type: 'wchibi', amount: 25, weight: 30 },
  { id: 2, type: 'chiblet', rarity: 'common', weight: 20 },
  { id: 3, type: 'wchibi', amount: 100, weight: 15 },
  { id: 4, type: 'chiblet', rarity: 'rare', weight: 10 },
  { id: 5, type: 'wchibi', amount: 50, weight: 20 },
  { id: 6, type: 'chiblet', rarity: 'epic', weight: 5 },
];

function getRandomReward() {
  const totalWeight = SPIN_REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const reward of SPIN_REWARDS) {
    random -= reward.weight;
    if (random <= 0) {
      return reward;
    }
  }
  
  return SPIN_REWARDS[0]; // Fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check daily spin limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const spinsToday = await prisma.spinWheelSpin.count({
      where: {
        userId,
        spunAt: {
          gte: today
        }
      }
    });

    if (spinsToday >= DAILY_SPIN_LIMIT) {
      return NextResponse.json(
        { error: 'Daily spin limit reached' },
        { status: 429 }
      );
    }

    // Get random reward
    const reward = getRandomReward();
    
    // Process the reward
    let updatedUser;
    let chibletAwarded = null;
    
    if (reward.type === 'wchibi') {
      // Add wCHIBI to user
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          wchibi: {
            increment: reward.amount
          }
        }
      });
    } else if (reward.type === 'chiblet') {
      // Award a random chiblet of the specified rarity
      const chibletSpecies = await prisma.chibletSpecies.findMany({
        where: {
          rarity: reward.rarity
        }
      });
      
      if (chibletSpecies.length > 0) {
        const randomSpecies = chibletSpecies[Math.floor(Math.random() * chibletSpecies.length)];
        
        // Create the chiblet for the user
        chibletAwarded = await prisma.userChiblet.create({
          data: {
            userId,
            speciesId: randomSpecies.id,
            level: 1,
            experience: 0,
            hp: randomSpecies.baseHp,
            maxHp: randomSpecies.baseHp,
            attack: randomSpecies.baseAttack,
            defense: randomSpecies.baseDefense,
            currentEnergy: 3, // Default energy
          },
          include: {
            species: true
          }
        });
      }
      
      updatedUser = user; // No coins change for chiblet rewards
    }

    // Record the spin
    await prisma.spinWheelSpin.create({
      data: {
        userId,
        reward: {
          type: reward.type,
          ...(reward.type === 'coins' ? { amount: reward.amount } : { rarity: reward.rarity }),
          ...(chibletAwarded ? { chibletId: chibletAwarded.id } : {})
        }
      }
    });

    // Calculate remaining spins
    const remainingSpins = DAILY_SPIN_LIMIT - (spinsToday + 1);

    return NextResponse.json({
      success: true,
        reward: {
          type: reward.type,
          ...(reward.type === 'wchibi' ? { amount: reward.amount } : { rarity: reward.rarity }),
          ...(chibletAwarded ? { 
            chiblet: {
              id: chibletAwarded.id,
              name: chibletAwarded.species.name,
              rarity: chibletAwarded.species.rarity
            }
          } : {})
        },
        remainingSpins,
        userWchibi: updatedUser?.wchibi || user.wchibi
    });

  } catch (error) {
    console.error('Spin error:', error);
    return NextResponse.json(
      { error: 'Spin failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check remaining spins
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

    // Check daily spins used
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const spinsToday = await prisma.spinWheelSpin.count({
      where: {
        userId,
        spunAt: {
          gte: today
        }
      }
    });

    const remainingSpins = Math.max(0, DAILY_SPIN_LIMIT - spinsToday);

    return NextResponse.json({
      success: true,
      remainingSpins,
      dailyLimit: DAILY_SPIN_LIMIT
    });

  } catch (error) {
    console.error('Get spins error:', error);
    return NextResponse.json(
      { error: 'Failed to get spin data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
