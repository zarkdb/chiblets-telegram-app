'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  telegramUsername?: string;
  photoUrl?: string;
  wchibi: number;
  level: number;
  totalWins: number;
  totalChiblets: number;
}

interface LeaderboardTabProps {
  user: any;
}

export default function LeaderboardTab({ user }: LeaderboardTabProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<any>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?userId=${user?.id}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
        setTotalPlayers(data.totalPlayers);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLeaderboard();
    }
  }, [user?.id]);

  const formatWchibi = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-600 to-amber-800';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h2>
          <p className="text-gray-600 text-sm">Top wCHIBI holders • {totalPlayers} total players</p>
        </div>

        {/* Current User Rank */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-2">Your Ranking</h3>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">
                  {getRankEmoji(currentUserRank.rank)}
                </span>
                <div className="text-left">
                  <div className="font-bold text-gray-800">Rank #{currentUserRank.rank}</div>
                  <div className="text-sm text-gray-600">{formatWchibi(currentUserRank.wchibi)} wCHIBI</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-4 border ${
                player.id === user?.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Rank */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${getRankColor(player.rank)} text-white font-bold`}>
                  {player.rank <= 3 ? getRankEmoji(player.rank) : `#${player.rank}`}
                </div>

                {/* Profile Picture */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {player.photoUrl ? (
                    <Image
                      src={player.photoUrl}
                      alt={player.displayName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                      <span className="text-white font-bold text-sm">
                        {player.displayName[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {player.displayName}
                    {player.id === user?.id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  {player.telegramUsername && (
                    <div className="text-xs text-gray-500">@{player.telegramUsername}</div>
                  )}
                  <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                    <span>Lv.{player.level}</span>
                    <span>🏆 {player.totalWins} wins</span>
                    <span>🐾 {player.totalChiblets} chiblets</span>
                  </div>
                </div>

                {/* wCHIBI Amount */}
                <div className="text-right">
                  <div className="font-bold text-lg text-yellow-600">
                    {formatWchibi(player.wchibi)}
                  </div>
                  <div className="text-xs text-gray-600">wCHIBI</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="text-center py-4">
          <button
            onClick={fetchLeaderboard}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
