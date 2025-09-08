'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArenaTabProps {
  user: any;
}

interface UserChiblet {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  experience: number;
  currentEnergy: number;
  species: {
    name: string;
    type: string;
    rarity: string;
  };
}

// Mock chiblets data with PvP stats
const mockChiblets = [
  {
    id: 1,
    name: 'Fire Pup',
    species: { name: 'Firefly', rarity: 'common', type: 'fire' },
    level: 5,
    speed: 8,
    strength: 12,
    stamina: 10,
    experience: 250,
    currentEnergy: 3,
    maxEnergy: 3,
  },
  {
    id: 2,
    name: 'Water Splash',
    species: { name: 'Aqua Pup', rarity: 'uncommon', type: 'water' },
    level: 3,
    speed: 10,
    strength: 8,
    stamina: 12,
    experience: 180,
    currentEnergy: 2,
    maxEnergy: 3,
  },
  {
    id: 3,
    name: 'Thunder Lord',
    species: { name: 'Storm Eagle', rarity: 'epic', type: 'air' },
    level: 7,
    speed: 15,
    strength: 10,
    stamina: 8,
    experience: 420,
    currentEnergy: 4,
    maxEnergy: 4,
  },
  {
    id: 4,
    name: 'Earth Guardian',
    species: { name: 'Rock Turtle', rarity: 'rare', type: 'earth' },
    level: 4,
    speed: 6,
    strength: 16,
    stamina: 14,
    experience: 200,
    currentEnergy: 3,
    maxEnergy: 3,
  },
];

// Mock opponents
const mockOpponents = [
  {
    id: 101,
    name: 'Shadow Cat',
    owner: 'Player_123',
    level: 4,
    speed: 9,
    strength: 11,
    stamina: 10,
    rarity: 'rare',
    type: 'dark',
  },
  {
    id: 102,
    name: 'Crystal Bear',
    owner: 'GamerX',
    level: 6,
    speed: 7,
    strength: 14,
    stamina: 12,
    rarity: 'epic',
    type: 'earth',
  },
  {
    id: 103,
    name: 'Wind Rider',
    owner: 'AirMaster',
    level: 5,
    speed: 13,
    strength: 8,
    stamina: 9,
    rarity: 'rare',
    type: 'air',
  },
  {
    id: 104,
    name: 'Flame Dragon',
    owner: 'DragonKing',
    level: 8,
    speed: 12,
    strength: 16,
    stamina: 11,
    rarity: 'legendary',
    type: 'fire',
  },
];

const battleModes = [
  { name: 'Speed Focus', stat: 'speed', icon: '⚡', color: 'text-blue-600', multiplier: 1.5 },
  { name: 'Strength Focus', stat: 'strength', icon: '💪', color: 'text-red-600', multiplier: 1.5 },
  { name: 'Stamina Focus', stat: 'stamina', icon: '🛡️', color: 'text-green-600', multiplier: 1.5 },
];

const typeEmojis = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  light: '✨',
  dark: '🌙',
};

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50',
};

export default function ArenaTab({ user }: ArenaTabProps) {
  const [gameState, setGameState] = useState<'selection' | 'matchmaking' | 'battle' | 'result'>('selection');
  const [selectedChiblet, setSelectedChiblet] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [opponentUser, setOpponentUser] = useState<any>(null);
  const [battleMode, setBattleMode] = useState<any>(null);
  const [currentStat, setCurrentStat] = useState<'stamina' | 'speed' | 'strength'>('stamina');
  const [battleStep, setBattleStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playerBoost, setPlayerBoost] = useState<number>(0);
  const [opponentBoost, setOpponentBoost] = useState<number>(0);
  const [roundResults, setRoundResults] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [mysberryCost] = useState(10);
  const [energyCost] = useState(1);

  const availableChiblets = mockChiblets.filter(c => c.currentEnergy > 0);
  const currentUser = { name: user?.name || 'You', rank: 0, avatar: '🎮' };

  const selectChiblet = (chiblet: any) => {
    setSelectedChiblet(chiblet);
    setShowConfirmModal(true);
  };

  const startMatchmaking = () => {
    setShowConfirmModal(false);
    setGameState('matchmaking');
    
    // Find random opponent
    const randomOpponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
    const randomOpponentUser = {
      name: randomOpponent.owner,
      rank: Math.floor(Math.random() * 10) + 1,
      avatar: '🐱'
    };
    
    setOpponent(randomOpponent);
    setOpponentUser(randomOpponentUser);
    
    // Generate random boosts
    setPlayerBoost(Math.floor(Math.random() * 40) + 5);
    setOpponentBoost(Math.floor(Math.random() * 40) + 5);
    
    // Start battle after matchmaking animation
    setTimeout(() => {
      setGameState('battle');
      startBattleSequence();
    }, 2000);
  };

  const startBattleSequence = async () => {
    const stats = ['stamina', 'speed', 'strength'] as const;
    let playerWins = 0;
    let opponentWins = 0;
    const results: string[] = [];
    
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      setCurrentStat(stat);
      setBattleStep(i + 1);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Calculate boosted stats
      const playerValue = selectedChiblet ? selectedChiblet[stat] * (1 + playerBoost / 100) : 0;
      const opponentValue = opponent ? opponent[stat] * (1 + opponentBoost / 100) : 0;
      
      let result = '';
      if (playerValue > opponentValue) {
        playerWins++;
        result = 'win';
      } else if (opponentValue > playerValue) {
        opponentWins++;
        result = 'lose';
      } else {
        result = 'draw';
      }
      
      results.push(result);
      setRoundResults([...results]);
    }
    
    // Determine final result
    await new Promise(resolve => setTimeout(resolve, 1000));
    const final = playerWins > opponentWins ? 'win' : opponentWins > playerWins ? 'lose' : 'draw';
    setFinalResult(final);
    setGameState('result');
  };

  const resetDuel = () => {
    setGameState('selection');
    setSelectedChiblet(null);
    setOpponent(null);
    setOpponentUser(null);
    setBattleMode(null);
    setCurrentStat('stamina');
    setBattleStep(0);
    setShowConfirmModal(false);
    setPlayerBoost(0);
    setOpponentBoost(0);
    setRoundResults([]);
    setFinalResult(null);
  };

  // Chiblet Card Component
  const ChibletCard = ({ chiblet, onClick, isOpponent = false }: any) => {
    const rarity = chiblet.species?.rarity || chiblet.rarity || 'common';
    const type = chiblet.species?.type || chiblet.type;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
          selectedChiblet?.id === chiblet.id ? 'border-blue-500 bg-blue-50' : 
          (rarityColors as any)[rarity] || 'border-gray-200 bg-white'
        }`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center mb-3">
          {/* Chiblet Image */}
          <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <img
              src={`/images/chiblets/${rarity}.png`}
              alt={chiblet.name}
              width={64}
              height={64}
              className="rounded-lg object-cover"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="text-2xl hidden">
              {typeEmojis[type as keyof typeof typeEmojis] || '⭐'}
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-800">{chiblet.name}</h3>
          <p className="text-sm text-gray-600">
            {isOpponent ? `@${chiblet.owner}` : `Level ${chiblet.level}`}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {rarity} • {typeEmojis[type as keyof typeof typeEmojis]} {type}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-bold text-blue-600">{chiblet.speed}</div>
            <div className="text-xs text-gray-500">⚡ Speed</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600">{chiblet.strength}</div>
            <div className="text-xs text-gray-500">💪 Strength</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{chiblet.stamina}</div>
            <div className="text-xs text-gray-500">🛡️ Stamina</div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Helper component for stat icons
  const StatIcon = ({ stat }: { stat: string }) => {
    const icons = {
      stamina: '🛡️',
      speed: '⚡',
      strength: '💪'
    };
    return <span>{icons[stat as keyof typeof icons]}</span>;
  };

  // Helper component for stat colors
  const getStatColor = (stat: string) => {
    const colors = {
      stamina: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', boost: 'bg-red-500' },
      speed: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', boost: 'bg-blue-500' },
      strength: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600', boost: 'bg-green-500' }
    };
    return colors[stat as keyof typeof colors];
  };

  return (
    <div className="h-full w-full bg-gray-50 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Selection Screen */}
        {gameState === 'selection' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 h-full"
          >
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-gray-800">Select Chiblet</h1>
            </div>

            <div className="space-y-3">
              {availableChiblets.map((chiblet, index) => (
                <motion.div
                  key={chiblet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:border-blue-300 transition-all"
                  onClick={() => selectChiblet(chiblet)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={`/images/${chiblet.species?.rarity || 'common'}.png`}
                        alt={chiblet.name}
                        className="w-14 h-14 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iMTIiIGZpbGw9IiNGOUZBRkIiLz4KPGP.IiBPeD0iMjgiIGN5PSIyOCIgcj0iMTIiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{chiblet.name}</h3>
                      <p className="text-sm text-gray-500">Level {chiblet.level}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{chiblet.stamina + chiblet.speed + chiblet.strength}</div>
                      <div className="text-xs text-gray-500">Total Stats</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Matchmaking Screen */}
        {gameState === 'matchmaking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center p-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⚔️</span>
              </div>
              <h2 className="text-lg font-medium text-gray-800">Finding opponent...</h2>
              <div className="w-48 bg-gray-200 rounded-full h-1">
                <motion.div
                  className="bg-blue-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Battle Screen */}
        {gameState === 'battle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col justify-center p-6"
          >
            {/* Current Stat Display */}
            {battleStep > 0 && (
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-700 capitalize mb-2">
                  <StatIcon stat={currentStat} /> {currentStat} Battle
                </h3>
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatColor(currentStat).text}`}>
                      {selectedChiblet ? (selectedChiblet[currentStat] * (1 + playerBoost / 100)).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-500">You (+{playerBoost}%)</div>
                  </div>
                  <div className="flex items-center text-gray-400 font-bold">VS</div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatColor(currentStat).text}`}>
                      {opponent ? (opponent[currentStat] * (1 + opponentBoost / 100)).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-500">Opponent (+{opponentBoost}%)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Large Chiblet Characters */}
            <div className="flex justify-center items-end space-x-8 mb-8">
              {/* Your Chiblet */}
              <motion.div
                animate={battleStep > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                className="text-center"
              >
                <div className="w-32 h-40 bg-gradient-to-b from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mb-3 overflow-hidden border border-blue-200">
                  <img
                    src={`/images/${selectedChiblet?.species?.rarity || 'common'}.png`}
                    alt={selectedChiblet?.name}
                    className="w-28 h-28 object-cover rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDExMiAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiByeD0iMjQiIGZpbGw9IiNGOUZBRkIiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjM2NkYxIj4KPHN0eWxlPi5jbHMtMXtmaWxsOiM2MzY2ZjE7fTwvc3R5bGU+CjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPgo8L3N2Zz4KPC9zdmc+';
                    }}
                  />
                </div>
                <h4 className="font-medium text-gray-800 text-sm">{selectedChiblet?.name}</h4>
                <div className="text-xs text-gray-500">Level {selectedChiblet?.level}</div>
              </motion.div>

              {/* VS Indicator */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-gray-600 font-bold text-sm">VS</span>
                </div>
              </div>

              {/* Opponent Chiblet */}
              <motion.div
                animate={battleStep > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-32 h-40 bg-gradient-to-b from-red-50 to-red-100 rounded-3xl flex items-center justify-center mb-3 overflow-hidden border border-red-200">
                  <img
                    src={`/images/${opponent?.rarity || 'common'}.png`}
                    alt={opponent?.name}
                    className="w-28 h-28 object-cover rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDExMiAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiByeD0iMjQiIGZpbGw9IiNGOUZBRkIiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRUY0NDQ0Ij4KPHN0eWxlPi5jbHMtMXtmaWxsOiNlZjQ0NDQ7fTwvc3R5bGU+CjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPgo8L3N2Zz4KPC9zdmc+';
                    }}
                  />
                </div>
                <h4 className="font-medium text-gray-800 text-sm">{opponent?.name}</h4>
                <div className="text-xs text-gray-500">@{opponent?.owner}</div>
              </motion.div>
            </div>

            {/* Battle Progress */}
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                {['stamina', 'speed', 'strength'].map((stat, index) => (
                  <div
                    key={stat}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      battleStep > index + 1 ? 'bg-green-500 text-white' :
                      battleStep === index + 1 ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <StatIcon stat={stat} />
                  </div>
                ))}
              </div>
              
              {battleStep === 0 ? (
                <p className="text-gray-600">Battle starting...</p>
              ) : battleStep <= 3 ? (
                <p className="text-gray-600">Round {battleStep} of 3</p>
              ) : (
                <p className="text-gray-600">Battle complete!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Battle Screen with Result Overlay */}
        {gameState === 'result' && (
          <>
            {/* Keep battle screen in background */}
            <motion.div
              className="h-full flex flex-col justify-center p-6 filter blur-sm"
            >
              {/* Current Stat Display */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-700 capitalize mb-2">
                  <StatIcon stat={currentStat} /> {currentStat} Battle
                </h3>
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatColor(currentStat).text}`}>
                      {selectedChiblet ? (selectedChiblet[currentStat] * (1 + playerBoost / 100)).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-500">You (+{playerBoost}%)</div>
                  </div>
                  <div className="flex items-center text-gray-400 font-bold">VS</div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatColor(currentStat).text}`}>
                      {opponent ? (opponent[currentStat] * (1 + opponentBoost / 100)).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-gray-500">Opponent (+{opponentBoost}%)</div>
                  </div>
                </div>
              </div>

              {/* Large Chiblet Characters */}
              <div className="flex justify-center items-end space-x-8 mb-8">
                {/* Your Chiblet */}
                <div className="text-center">
                  <div className="w-32 h-40 bg-gradient-to-b from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mb-3 overflow-hidden border border-blue-200">
                    <img
                      src={`/images/${selectedChiblet?.species?.rarity || 'common'}.png`}
                      alt={selectedChiblet?.name}
                      className="w-28 h-28 object-cover rounded-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDExMiAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiByeD0iMjQiIGZpbGw9IiNGOUZBRkIiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjM2NkYxIj4KPHN0eWxlPi5jbHMtMXtmaWxsOiM2MzY2ZjE7fTwvc3R5bGU+CjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPgo8L3N2Zz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm">{selectedChiblet?.name}</h4>
                  <div className="text-xs text-gray-500">Level {selectedChiblet?.level}</div>
                </div>

                {/* VS Indicator */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <span className="text-gray-600 font-bold text-sm">VS</span>
                  </div>
                </div>

                {/* Opponent Chiblet */}
                <div className="text-center">
                  <div className="w-32 h-40 bg-gradient-to-b from-red-50 to-red-100 rounded-3xl flex items-center justify-center mb-3 overflow-hidden border border-red-200">
                    <img
                      src={`/images/${opponent?.rarity || 'common'}.png`}
                      alt={opponent?.name}
                      className="w-28 h-28 object-cover rounded-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDExMiAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMTIiIGhlaWdodD0iMTEyIiByeD0iMjQiIGZpbGw9IiNGOUZBRkIiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjRUY0NDQ0Ij4KPHN0eWxlPi5jbHMtMXtmaWxsOiNlZjQ0NDQ7fTwvc3R5bGU+CjxjaXJjbGUgY2xhc3M9ImNscy0xIiBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPgo8L3N2Zz4KPC9zdmc+';
                      }}
                    />
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm">{opponent?.name}</h4>
                  <div className="text-xs text-gray-500">@{opponent?.owner}</div>
                </div>
              </div>

              {/* Battle Progress */}
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-4">
                  {['stamina', 'speed', 'strength'].map((stat, index) => (
                    <div
                      key={stat}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-green-500 text-white"
                    >
                      <StatIcon stat={stat} />
                    </div>
                  ))}
                </div>
                <p className="text-gray-600">Battle complete!</p>
              </div>
            </motion.div>

            {/* Victory/Defeat Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={resetDuel}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Result Icon */}
                <div className="text-5xl mb-4">
                  {finalResult === 'win' ? '🏆' : finalResult === 'lose' ? '😔' : '🤝'}
                </div>

                {/* Result Title */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {finalResult === 'win' ? 'Victory!' : 
                   finalResult === 'lose' ? 'Defeat' : 'Draw'}
                </h2>

                {/* XP Reward */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">✨</span>
                    <span className="font-semibold text-gray-800">
                      +{finalResult === 'win' ? '50' : finalResult === 'draw' ? '25' : '10'} XP
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Experience earned</p>
                </div>

                {/* Action Button */}
                <button
                  onClick={resetDuel}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  Battle Again
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedChiblet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">Start Battle?</h2>

            {/* Chiblet Info */}
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={`/images/${selectedChiblet.species?.rarity || 'common'}.png`}
                  alt={selectedChiblet.name}
                  className="w-10 h-10 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjRDFENU0UCiLz4K';
                  }}
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{selectedChiblet.name}</h3>
                <p className="text-sm text-gray-500">Level {selectedChiblet.level}</p>
              </div>
            </div>

            {/* Cost */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <span className="text-gray-600">Cost:</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="text-yellow-500">⚡</span>
                  <span>{energyCost}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="text-red-500">🍓</span>
                  <span>{mysberryCost}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={startMatchmaking}
                className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors"
              >
                Start Battle
              </button>
              
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
