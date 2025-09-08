'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChibletsTab from './tabs/ChibletsTab';
import ReferralTab from './tabs/ReferralTab';
import ArenaTab from './tabs/ArenaTab';
import TaskTab from './tabs/TaskTab';
import ProfileTab from './tabs/ProfileTab';
import UserHeader from './UserHeader';

interface GameInterfaceProps {
  user: any;
}

type TabType = 'chiblets' | 'referral' | 'arena' | 'tasks' | 'profile';

const tabs = [
  { id: 'chiblets', name: 'Chiblets', icon: '🐾', emoji: '🐾' },
  { id: 'referral', name: 'Referral', icon: '👥', emoji: '👥' },
  { id: 'arena', name: 'PvP', icon: '⚔️', emoji: '⚔️' },
  { id: 'tasks', name: 'Tasks', icon: '✓', emoji: '✓' },
  { id: 'profile', name: 'Profile', icon: '👤', emoji: '👤' },
] as const;

export default function GameInterface({ user }: GameInterfaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chiblets');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chiblets':
        return <ChibletsTab user={user} />;
      case 'referral':
        return <ReferralTab user={user} />;
      case 'arena':
        return <ArenaTab user={user} />;
      case 'tasks':
        return <TaskTab user={user} />;
      case 'profile':
        return <ProfileTab user={user} />;
      default:
        return <ChibletsTab user={user} />;
    }
  };

  return (
    <div className="game-container bg-white flex flex-col h-screen max-h-screen overflow-hidden relative">
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full absolute inset-0"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 safe-area">
        <div className="flex items-center justify-around py-1 px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 max-w-[80px] relative ${
                  isActive
                    ? 'bg-game-primary text-white shadow-md transform scale-[1.02]'
                    : 'text-gray-600 hover:text-game-primary hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="text-lg mb-0.5">{tab.emoji}</div>
                <div className={`text-[10px] font-medium leading-tight ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {tab.name}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
