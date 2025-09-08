import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// GET - Fetch user's tasks
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

    // Get all active tasks
    const tasks = await prisma.task.findMany({
      where: {
        isActive: true
      },
      include: {
        completions: {
          where: {
            userId: userId
          }
        }
      }
    });

    // Format tasks with completion status
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      reward: task.reward,
      url: task.url,
      status: task.completions.length > 0 ? task.completions[0].status : 'PENDING',
      completedAt: task.completions.length > 0 ? task.completions[0].completedAt : null,
      claimedAt: task.completions.length > 0 ? task.completions[0].claimedAt : null,
    }));

    return NextResponse.json({
      success: true,
      tasks: formattedTasks
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to get tasks' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Complete a task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskId, action } = body;

    if (!userId || !taskId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'complete') {
      // Mark task as completed
      const taskCompletion = await prisma.taskCompletion.upsert({
        where: {
          userId_taskId: {
            userId,
            taskId
          }
        },
        update: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date()
        },
        create: {
          userId,
          taskId,
          status: TaskStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Task completed',
        taskCompletion
      });

    } else if (action === 'claim') {
      // Check if task is completed but not claimed
      const taskCompletion = await prisma.taskCompletion.findUnique({
        where: {
          userId_taskId: {
            userId,
            taskId
          }
        }
      });

      if (!taskCompletion) {
        return NextResponse.json(
          { error: 'Task not completed yet' },
          { status: 400 }
        );
      }

      if (taskCompletion.status === TaskStatus.CLAIMED) {
        return NextResponse.json(
          { error: 'Task already claimed' },
          { status: 400 }
        );
      }

      if (taskCompletion.status !== TaskStatus.COMPLETED) {
        return NextResponse.json(
          { error: 'Task not completed yet' },
          { status: 400 }
        );
      }

      // Process the reward
      const reward = task.reward as any;
      let updatedUser = user;

      if (reward.type === 'wchibi') {
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
          
          await prisma.userChiblet.create({
            data: {
              userId,
              speciesId: randomSpecies.id,
              level: 1,
              experience: 0,
              hp: randomSpecies.baseHp,
              maxHp: randomSpecies.baseHp,
              attack: randomSpecies.baseAttack,
              defense: randomSpecies.baseDefense,
              currentEnergy: 3,
            }
          });
        }
      }

      // Mark task as claimed
      await prisma.taskCompletion.update({
        where: {
          userId_taskId: {
            userId,
            taskId
          }
        },
        data: {
          status: TaskStatus.CLAIMED,
          claimedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Reward claimed',
        userWchibi: updatedUser.wchibi,
        reward
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Task action error:', error);
    return NextResponse.json(
      { error: 'Task action failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
