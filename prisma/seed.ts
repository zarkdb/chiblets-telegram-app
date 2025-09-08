import { PrismaClient, TaskType } from '@prisma/client';

const prisma = new PrismaClient();

const chibletSpecies = [
  // Common Chiblets
  {
    name: 'Flame Pup',
    type: 'fire',
    rarity: 'common',
    baseHp: 50,
    baseAttack: 35,
    baseDefense: 25,
    spriteUrl: '/images/chiblets/common.png',
    description: 'A small fiery companion that loves to play in the warmth.',
  },
  {
    name: 'Water Sprite',
    type: 'water',
    rarity: 'common',
    baseHp: 55,
    baseAttack: 30,
    baseDefense: 30,
    spriteUrl: '/images/chiblets/common.png',
    description: 'A gentle water creature that brings refreshing energy.',
  },
  {
    name: 'Earth Cub',
    type: 'earth',
    rarity: 'common',
    baseHp: 60,
    baseAttack: 25,
    baseDefense: 35,
    spriteUrl: '/images/chiblets/common.png',
    description: 'A sturdy ground-type chiblet with a love for nature.',
  },
  {
    name: 'Wind Wisp',
    type: 'air',
    rarity: 'common',
    baseHp: 45,
    baseAttack: 40,
    baseDefense: 20,
    spriteUrl: '/images/chiblets/common.png',
    description: 'A swift air chiblet that dances on the breeze.',
  },

  // Rare Chiblets
  {
    name: 'Inferno Wolf',
    type: 'fire',
    rarity: 'rare',
    baseHp: 80,
    baseAttack: 65,
    baseDefense: 45,
    spriteUrl: '/images/chiblets/rare.png',
    description: 'A fierce fire wolf with blazing determination.',
  },
  {
    name: 'Tidal Guardian',
    type: 'water',
    rarity: 'rare',
    baseHp: 85,
    baseAttack: 55,
    baseDefense: 55,
    spriteUrl: '/images/chiblets/rare.png',
    description: 'A majestic water guardian that controls the tides.',
  },
  {
    name: 'Stone Titan',
    type: 'earth',
    rarity: 'rare',
    baseHp: 100,
    baseAttack: 50,
    baseDefense: 70,
    spriteUrl: '/images/chiblets/rare.png',
    description: 'A massive earth titan with unbreakable defense.',
  },
  {
    name: 'Storm Eagle',
    type: 'air',
    rarity: 'rare',
    baseHp: 70,
    baseAttack: 75,
    baseDefense: 35,
    spriteUrl: '/images/chiblets/rare.png',
    description: 'A powerful eagle that commands the storms.',
  },

  // Epic Chiblets
  {
    name: 'Phoenix Lord',
    type: 'fire',
    rarity: 'epic',
    baseHp: 120,
    baseAttack: 95,
    baseDefense: 65,
    spriteUrl: '/images/chiblets/epic.png',
    description: 'A legendary phoenix that rises from the ashes.',
  },
  {
    name: 'Leviathan King',
    type: 'water',
    rarity: 'epic',
    baseHp: 130,
    baseAttack: 85,
    baseDefense: 75,
    spriteUrl: '/images/chiblets/epic.png',
    description: 'The ruler of all seas, a legendary water beast.',
  },
  {
    name: 'Terra Colossus',
    type: 'earth',
    rarity: 'epic',
    baseHp: 140,
    baseAttack: 80,
    baseDefense: 90,
    spriteUrl: '/images/chiblets/epic.png',
    description: 'An ancient earth guardian of immense power.',
  },
  {
    name: 'Sky Sovereign',
    type: 'air',
    rarity: 'epic',
    baseHp: 110,
    baseAttack: 100,
    baseDefense: 60,
    spriteUrl: '/images/chiblets/epic.png',
    description: 'The ultimate master of wind and lightning.',
  },

  // Legendary Chiblets
  {
    name: 'Infernal Emperor',
    type: 'fire',
    rarity: 'legendary',
    baseHp: 200,
    baseAttack: 150,
    baseDefense: 100,
    spriteUrl: '/images/chiblets/legendary.png',
    description: 'The supreme ruler of all fire, born from the core of stars.',
  },
  {
    name: 'Abyssal Sovereign',
    type: 'water',
    rarity: 'legendary',
    baseHp: 220,
    baseAttack: 130,
    baseDefense: 120,
    spriteUrl: '/images/chiblets/legendary.png',
    description: 'The ancient lord of the deepest oceans and darkest waters.',
  },
  {
    name: 'World Tree Ancient',
    type: 'earth',
    rarity: 'legendary',
    baseHp: 250,
    baseAttack: 120,
    baseDefense: 150,
    spriteUrl: '/images/chiblets/legendary.png',
    description: 'The eternal guardian of all life, older than time itself.',
  },
  {
    name: 'Celestial Archon',
    type: 'air',
    rarity: 'legendary',
    baseHp: 180,
    baseAttack: 180,
    baseDefense: 80,
    spriteUrl: '/images/chiblets/legendary.png',
    description: 'A divine being that commands the very fabric of the sky.',
  },
];

const tasks = [
  {
    title: 'Follow @ChibletsGame',
    description: 'Follow our official X (Twitter) account',
    type: TaskType.TWITTER_FOLLOW,
    reward: { type: 'wchibi', amount: 100 },
    url: 'https://twitter.com/chibletsgame',
  },
  {
    title: 'Like our latest post',
    description: 'Like our most recent announcement',
    type: TaskType.TWITTER_LIKE,
    reward: { type: 'wchibi', amount: 50 },
    url: 'https://twitter.com/chibletsgame',
  },
  {
    title: 'Retweet our post',
    description: 'Share our latest update with your followers',
    type: TaskType.TWITTER_RETWEET,
    reward: { type: 'wchibi', amount: 75 },
    url: 'https://twitter.com/chibletsgame',
  },
  {
    title: 'Comment on our post',
    description: 'Leave a comment on our latest announcement',
    type: TaskType.TWITTER_COMMENT,
    reward: { type: 'wchibi', amount: 80 },
    url: 'https://twitter.com/chibletsgame',
  },
  {
    title: 'Daily Login',
    description: 'Login to the game daily',
    type: TaskType.DAILY_LOGIN,
    reward: { type: 'wchibi', amount: 25 },
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in development
  if (process.env.NODE_ENV === 'development') {
    await prisma.spinWheelSpin.deleteMany();
    await prisma.taskCompletion.deleteMany();
    await prisma.task.deleteMany();
    await prisma.chibletSpecies.deleteMany();
    console.log('🧹 Cleared existing data');
  }

  // Seed chiblet species
  console.log('🐾 Seeding chiblet species...');
  for (const species of chibletSpecies) {
    await prisma.chibletSpecies.create({ data: species });
  }

  // Seed tasks
  console.log('📋 Seeding tasks...');
  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Database seed completed successfully!');
  console.log(`
📊 Seeded:
  - ${chibletSpecies.length} chiblet species
  - ${tasks.length} tasks
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
