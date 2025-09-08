import { NextRequest, NextResponse } from 'next/server';
import { simulateBattle, processBattleResults } from '@/lib/battle-system';
import { getChibletLevelInfo, levelUpChiblet } from '@/lib/chiblet-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, playerChibletId, opponentChibletId } = body;

    if (!userId || !playerChibletId || !opponentChibletId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate the battle
    const battleResult = await simulateBattle(playerChibletId, opponentChibletId);

    // Process the battle results and update database
    const processedResult = await processBattleResults(
      userId,
      playerChibletId,
      opponentChibletId,
      battleResult
    );

    // Check if the player's chiblet can level up after gaining experience
    const updatedChiblet = processedResult.updatedPlayerChiblet;
    let levelUpResult = null;

    if (battleResult.winner === 'player') {
      const levelInfo = getChibletLevelInfo(updatedChiblet.level, updatedChiblet.experience);
      
      if (levelInfo.canLevelUp) {
        try {
          levelUpResult = await levelUpChiblet(playerChibletId);
        } catch (error) {
          console.log('Level up failed:', error);
          // Continue without level up - the experience is still gained
        }
      }
    }

    return NextResponse.json({
      success: true,
      battle: {
        winner: battleResult.winner,
        rounds: battleResult.rounds,
        expGained: battleResult.expGained,
        wchibiGained: battleResult.wchibiGained,
      },
      playerChiblet: levelUpResult?.chiblet || updatedChiblet,
      levelUp: levelUpResult ? {
        newLevel: levelUpResult.newLevel,
        statsGained: levelUpResult.statsGained
      } : null,
      battleRecord: processedResult.battleRecord
    });

  } catch (error) {
    console.error('PvP battle error:', error);
    return NextResponse.json(
      { error: 'Battle failed' },
      { status: 500 }
    );
  }
}
