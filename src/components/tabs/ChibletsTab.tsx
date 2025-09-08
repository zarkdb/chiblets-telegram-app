'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChibletCard from '../ChibletCard';
import ChibletDetailModal from '../ChibletDetailModal';
import { RARITY_COLORS } from '@/lib/game-config';

interface ChibletsTabProps {
  user: any;
}

// Mock chiblet data - replace with actual API call
const mockChiblets = [
  {
    id: '1',
    name: 'Flame Pup',
    species: { name: 'Firefly', rarity: 'common', type: 'fire', description: 'A small fiery companion' },
    level: 5,
    experience: 250,
    power: 57,
    hp: 57,
    maxHp: 57,
    currentEnergy: 2,
    maxEnergy: 3,
    incomePerHour: 5,
    isActive: true,
  },
  {
    id: '2',
    name: 'Splash',
    species: { name: 'Aqua Pup', rarity: 'common', type: 'water', description: 'A playful water chiblet' },
    level: 3,
    experience: 100,
    power: 34,
    hp: 34,
    maxHp: 34,
    currentEnergy: 3,
    maxEnergy: 3,
    incomePerHour: 3,
    isActive: true,
  },
  {
    id: '3',
    name: 'Crystal',
    species: { name: 'Crystal Bear', rarity: 'epic', type: 'earth', description: 'An epic crystalline warrior' },
    level: 2,
    experience: 50,
    power: 149,
    hp: 149,
    maxHp: 149,
    currentEnergy: 4,
    maxEnergy: 6,
    incomePerHour: 17,
    isActive: true,
  },
  {
    id: '4',
    name: 'Rocky',
    species: { name: 'Rocky', rarity: 'common', type: 'earth', description: 'A sturdy earth chiblet' },
    level: 1,
    experience: 0,
    power: 10,
    hp: 10,
    maxHp: 10,
    currentEnergy: 3,
    maxEnergy: 3,
    incomePerHour: 1,
    isActive: false,
  },
  {
    id: '5',
    name: 'Thunder',
    species: { name: 'Storm Eagle', rarity: 'epic', type: 'air', description: 'Commands the storms' },
    level: 1,
    experience: 0,
    power: 60,
    hp: 60,
    maxHp: 60,
    currentEnergy: 6,
    maxEnergy: 6,
    incomePerHour: 8,
    isActive: false,
  },
];

export default function ChibletsTab({ user }: ChibletsTabProps) {
  const [chiblets, setChiblets] = useState(mockChiblets);
  const [selectedChiblet, setSelectedChiblet] = useState<any>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('level');

  // Filter and sort chiblets
  const filteredChiblets = chiblets
    .filter(chiblet => filterRarity === 'all' || chiblet.species.rarity === filterRarity)
    .sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'power':
          return b.power - a.power;
        case 'rarity':
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
          return rarityOrder[b.species.rarity as keyof typeof rarityOrder] - rarityOrder[a.species.rarity as keyof typeof rarityOrder];
        default:
          return 0;
      }
    });

  const activeChiblets = chiblets.filter(c => c.isActive);
  const totalPower = activeChiblets.reduce((total, c) => total + c.power, 0);
  const totalIncome = chiblets.reduce((total, c) => total + c.incomePerHour, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">My Chiblets</h2>
          <div className="flex items-center space-x-1.5">
            {/* Rarity Filter */}
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
            >
              <option value="all">All</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
            >
              <option value="level">Level</option>
              <option value="power">Power</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chiblets Grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {filteredChiblets.map((chiblet, index) => (
            <motion.div
              key={chiblet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ChibletCard
                chiblet={chiblet}
                onClick={() => setSelectedChiblet(chiblet)}
              />
            </motion.div>
          ))}
        </div>

        {filteredChiblets.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">🐾</div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">No Chiblets Found</h3>
            <p className="text-gray-500 text-sm px-4">Try changing your filters or get new chiblets from the shop!</p>
          </div>
        )}

        {/* Add padding at bottom for safe scrolling */}
        <div className="h-16" />
      </div>

      {/* Chiblet Detail Modal */}
      <AnimatePresence>
        {selectedChiblet && (
          <ChibletDetailModal
            chiblet={selectedChiblet}
            onClose={() => setSelectedChiblet(null)}
            onUpdate={(updatedChiblet) => {
              setChiblets(prev => prev.map(c => c.id === updatedChiblet.id ? updatedChiblet : c));
              setSelectedChiblet(updatedChiblet);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
