'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ReferralTabProps {
  user: any;
}

export default function ReferralTab({ user }: ReferralTabProps) {
  const referralCode = user.telegramId ? `CHIBLET${user.telegramId.slice(-6).toUpperCase()}` : 'CHIBLETXXX';
  const referralLink = `https://t.me/chibletsbot?start=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      // Could add a simple alert or toast notification here
      alert('Referral link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me in ChibletsLite!',
        text: 'Collect cute chiblets and battle monsters together!',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">👥</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Invite Friends</h1>
        <p className="text-gray-600 text-sm">
          Share your referral code and earn rewards together!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-800">0</div>
          <div className="text-xs text-gray-500">Invited</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-800">0</div>
          <div className="text-xs text-gray-500">Joined</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-800">0</div>
          <div className="text-xs text-gray-500">Earned</div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-800 mb-3 text-center">Your Referral Code</h3>
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-blue-600">{referralCode}</div>
            <div className="text-xs text-gray-500 mt-1">Share this code with friends</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyLink}
            className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            📋 Copy Link
          </button>
          <button
            onClick={handleShare}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            📤 Share
          </button>
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-800 mb-3 text-center">Referral Rewards</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">Friend joins</div>
              <div className="text-xs text-gray-500">Instant reward</div>
            </div>
            <div className="font-bold text-yellow-600">+100</div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-sm">Friend reaches Level 5</div>
              <div className="text-xs text-gray-500">Milestone bonus</div>
            </div>
            <div className="font-bold text-purple-600">+5 💎</div>
          </div>
        </div>
      </div>

      {/* Friends List (Empty State) */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">👋</div>
          <h4 className="font-medium text-gray-700 mb-2">No friends yet</h4>
          <p className="text-gray-500 text-sm mb-4">
            Start inviting friends to earn rewards!
          </p>
          <button
            onClick={handleShare}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Invite Friends
          </button>
        </div>
      </div>
    </div>
  );
}
