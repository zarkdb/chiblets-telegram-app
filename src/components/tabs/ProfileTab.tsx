'use client';

import React from 'react';
import Image from 'next/image';

interface ProfileTabProps {
  user: any;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  // Calculate total chiblets (mock data for now)
  const totalChiblets = 12; // This would come from user's chiblet collection
  
  // Calculate total wins (mock data for now)
  const totalWins = 8; // This would come from user's battle history
  
  // Format currency for display
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <span className="text-white text-2xl font-bold">
                    {user.firstName?.[0] || user.username?.[0] || '👤'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user.firstName || user.username || 'Player'}
            </h2>
            {user.username && (
              <p className="text-gray-500 text-sm">@{user.username}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          {/* wCHIBI Balance */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-700 font-medium mb-1">wCHIBI Balance</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {formatCurrency(user.wchibi || 0)} wCHIBI
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Total Chiblets */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-700 font-medium mb-1">Total Chiblets</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {totalChiblets}
                </p>
                <p className="text-sm text-gray-500 mt-1">Collected creatures</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
            </div>
          </div>

          {/* Total Wins */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-700 font-medium mb-1">Total Wins</h3>
                <p className="text-3xl font-bold text-green-600">
                  {totalWins}
                </p>
                <p className="text-sm text-gray-500 mt-1">Battle victories</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-800 mb-4">Account Details</h3>
          
          <div className="space-y-3">
            {/* Telegram ID */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Telegram ID</span>
              <span className="font-medium text-gray-800">
                {user.telegramId || 'Not connected'}
              </span>
            </div>

            {/* Level */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Level</span>
              <span className="font-medium text-gray-800">
                {user.level || 1}
              </span>
            </div>

            {/* Join Date */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member since</span>
              <span className="font-medium text-gray-800">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </span>
            </div>

            {/* Language */}
            {user.languageCode && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Language</span>
                <span className="font-medium text-gray-800 uppercase">
                  {user.languageCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Achievement Preview */}
        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="font-bold text-gray-800 mb-4">Recent Achievement</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌟</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">First Steps</h4>
              <p className="text-sm text-gray-600">Welcome to Chiblets!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
