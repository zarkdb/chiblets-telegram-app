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

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50', 
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50',
};

const typeEmojis = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  light: '✨',
  dark: '🌙',
};

export default function ArenaTab({ user }: ArenaTabProps) {
  const [gameState, setGameState] = useState<'selection' | 'finding' | 'battle' | 'result'>('selection');
  const [userChiblets, setUserChiblets] = useState<UserChiblet[]>([]);
  const [selectedChiblet, setSelectedChiblet] = useState<UserChiblet | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's chiblets on component mount
  const fetchUserChiblets = async () => {
    try {
      setLoading(true);
      // Mock fetch - replace with real API call
      const mockChiblets: UserChiblet[] = [
        {
          id: 'chiblet1',
          name: 'My Flame Pup',
          level: 3,
          hp: 60,
          maxHp: 60,
          attack: 42,
          defense: 30,
          experience: 250,
          currentEnergy: 3,
          species: {
            name: 'Flame Pup',
            type: 'fire',
            rarity: 'common'
          }
        }
      ];
      setUserChiblets(mockChiblets);
    } catch (err) {
      setError('Failed to load chiblets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserChiblets();
    }
  }, [user?.id]);

  const handleFindOpponent = async (chiblet: UserChiblet) => {
    try {
      setSelectedChiblet(chiblet);
      setGameState('finding');
      setError(null);

      const response = await fetch('/api/battle/find-opponent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          chibletId: chiblet.id
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setOpponent(data.opponent);
      setTimeout(() => {
        setGameState('battle');
        handleBattle(chiblet.id, data.opponent.id);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setGameState('selection');
    }
  };

  const handleBattle = async (playerChibletId: string, opponentChibletId: string) => {
    try {
      const response = await fetch('/api/battle/pvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          playerChibletId,
          opponentChibletId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setBattleResult(data);
      setGameState('result');
      
      // Refresh chiblets after battle
      fetchUserChiblets();

    } catch (err: any) {
      setError(err.message);
      setGameState('selection');
    }
  };

  const resetGame = () => {
    setGameState('selection');
    setSelectedChiblet(null);
    setOpponent(null);
    setBattleResult(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chiblets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">⚔️ PvP Arena</h2>
          <p className="text-gray-600 text-sm">Battle other players to gain experience and wCHIBI</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-center">{error}</p>
            <button
              onClick={resetGame}
              className="mt-2 mx-auto block bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {gameState === 'selection' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-gray-800">Choose Your Chiblet</h3>
              
              {userChiblets.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600">You don't have any chiblets yet!</p>
                  <p className="text-sm text-gray-500 mt-2">Complete tasks or spin the wheel to get your first chiblet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {userChiblets.map((chiblet) => {
                    const canBattle = chiblet.currentEnergy > 0 && chiblet.hp > 0;
                    return (
                      <div
                        key={chiblet.id}
                        className={`p-4 rounded-xl border-2 ${
                          rarityColors[chiblet.species.rarity as keyof typeof rarityColors]
                        } ${canBattle ? 'cursor-pointer hover:shadow-md' : 'opacity-50'}`}
                        onClick={() => canBattle && handleFindOpponent(chiblet)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">
                            {typeEmojis[chiblet.species.type as keyof typeof typeEmojis] || '🐾'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{chiblet.name}</div>
                            <div className="text-sm text-gray-600">
                              Level {chiblet.level} • {chiblet.species.rarity} {chiblet.species.type}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              HP: {chiblet.hp}/{chiblet.maxHp} • ATK: {chiblet.attack} • DEF: {chiblet.defense}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ⚡ {chiblet.currentEnergy}
                            </div>
                            {canBattle ? (
                              <div className="text-xs text-green-600">Ready!</div>
                            ) : (
                              <div className="text-xs text-red-600">
                                {chiblet.hp <= 0 ? 'Fainted' : 'No Energy'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'finding' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 space-y-6"
            >
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">Finding Opponent...</h3>
                <p className="text-gray-600 mt-2">Searching for a worthy challenger</p>
              </div>
            </motion.div>
          )}

          {gameState === 'battle' && opponent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-6"
            >
              <h3 className="font-bold text-xl text-gray-800">⚔️ Battle in Progress</h3>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Player */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {selectedChiblet && typeEmojis[selectedChiblet.species.type as keyof typeof typeEmojis]}
                    </div>
                    <div className="font-medium">{selectedChiblet?.name}</div>
                    <div className="text-sm text-gray-600">Level {selectedChiblet?.level}</div>
                  </div>
                  
                  {/* VS */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">VS</div>
                  </div>
                  
                  {/* Opponent */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {typeEmojis[opponent.species.type as keyof typeof typeEmojis]}
                    </div>
                    <div className="font-medium">{opponent.name}</div>
                    <div className="text-sm text-gray-600">Level {opponent.level}</div>
                  </div>
                </div>
              </div>

              <div className="animate-pulse">
                <p className="text-gray-600">Battle simulation in progress...</p>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && battleResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className={`text-6xl mb-4 ${
                  battleResult.battle.winner === 'player' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {battleResult.battle.winner === 'player' ? '🎉' : '😔'}
                </div>
                <h3 className={`text-2xl font-bold ${
                  battleResult.battle.winner === 'player' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {battleResult.battle.winner === 'player' ? 'Victory!' : 'Defeat!'}
                </h3>
              </div>

              {battleResult.battle.winner === 'player' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h4 className="font-bold text-green-800 mb-3">Rewards Earned:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-medium">+{battleResult.battle.expGained} XP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>wCHIBI:</span>
                      <span className="font-medium">+{battleResult.battle.wchibiGained}</span>
                    </div>
                  </div>
                  
                  {battleResult.levelUp && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <p className="font-bold text-yellow-800">
                        🎊 Level Up! Your chiblet reached level {battleResult.levelUp.newLevel}!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={resetGame}
                  className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600"
                >
                  Battle Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
