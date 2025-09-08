import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const currentUserId = searchParams.get('userId'); // Optional: to get current user's rank

    // Get top wCHIBI holders
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        telegramUsername: true,
        photoUrl: true,
        wchibi: true,
        level: true,
        totalWins: true,
        totalChiblets: true,
        createdAt: true,
      },
      orderBy: {
        wchibi: 'desc'
      },
      take: limit
    });

    // Add ranking to each user
    const leaderboard = topUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      displayName: user.firstName || user.telegramUsername || `User${user.telegramId.slice(-4)}`
    }));

    let currentUserRank = null;

    // If currentUserId is provided, find their rank if not in top list
    if (currentUserId) {
      const currentUserInTop = leaderboard.find(user => user.id === currentUserId);
      
      if (!currentUserInTop) {
        // Count users with more wCHIBI than current user
        const currentUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { wchibi: true }
        });

        if (currentUser) {
          const usersAhead = await prisma.user.count({
            where: {
              wchibi: {
                gt: currentUser.wchibi
              }
            }
          });

          currentUserRank = {
            rank: usersAhead + 1,
            wchibi: currentUser.wchibi
          };
        }
      } else {
        currentUserRank = {
          rank: currentUserInTop.rank,
          wchibi: currentUserInTop.wchibi
        };
      }
    }

    // Get total number of players
    const totalPlayers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
      totalPlayers,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
