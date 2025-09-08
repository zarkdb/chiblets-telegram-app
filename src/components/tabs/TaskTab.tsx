'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TaskTabProps {
  user: any;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'twitter_follow' | 'twitter_like' | 'twitter_retweet' | 'twitter_comment';
  reward: number;
  status: 'pending' | 'completed' | 'claimed';
  url?: string;
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Follow @ChibletsGame',
    description: 'Follow our official X (Twitter) account',
    type: 'twitter_follow',
    reward: 100,
    status: 'pending',
    url: 'https://twitter.com/chibletsgame'
  },
  {
    id: '2',
    title: 'Like our latest post',
    description: 'Like our most recent announcement',
    type: 'twitter_like',
    reward: 50,
    status: 'pending',
    url: 'https://twitter.com/chibletsgame'
  },
  {
    id: '3',
    title: 'Retweet our post',
    description: 'Share our latest update with your followers',
    type: 'twitter_retweet',
    reward: 75,
    status: 'pending',
    url: 'https://twitter.com/chibletsgame'
  },
  {
    id: '4',
    title: 'Comment on our post',
    description: 'Leave a comment on our latest announcement',
    type: 'twitter_comment',
    reward: 80,
    status: 'pending',
    url: 'https://twitter.com/chibletsgame'
  }
];

export default function TaskTab({ user }: TaskTabProps) {
  const [isXConnected, setIsXConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [connectingX, setConnectingX] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showSpinModal, setShowSpinModal] = useState(false);

  // Spin wheel rewards
  const spinRewards = [
    { id: 1, label: '25 wCHIBI', value: '25_wchibi', color: '#FEF3C7', icon: '🪙' },
    { id: 2, label: 'Common Chiblet', value: 'common_chiblet', color: '#F9FAFB', icon: '🐾' },
    { id: 3, label: '100 wCHIBI', value: '100_wchibi', color: '#FEF3C7', icon: '🪙' },
    { id: 4, label: 'Rare Chiblet', value: 'rare_chiblet', color: '#DBEAFE', icon: '🔥' },
    { id: 5, label: '50 wCHIBI', value: '50_wchibi', color: '#FEF3C7', icon: '🪙' },
    { id: 6, label: 'Epic Chiblet', value: 'epic_chiblet', color: '#F3E8FF', icon: '✨' },
  ];

  const handleSpin = () => {
    if (spinsLeft <= 0 || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    // Random rotation between 1800-3600 degrees (5-10 full rotations)
    const randomRotation = 1800 + Math.random() * 1800;
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);

    // Calculate which reward was selected
    const segmentAngle = 360 / spinRewards.length;
    const normalizedRotation = newRotation % 360;
    const selectedIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % spinRewards.length;
    const selectedReward = spinRewards[selectedIndex];

    // Show result after animation completes
    setTimeout(() => {
      setSpinResult(selectedReward.label);
      setSpinsLeft(prev => prev - 1);
      setIsSpinning(false);
    }, 3000);
  };

  const handleXConnect = async () => {
    setConnectingX(true);
    // Simulate X connection process
    setTimeout(() => {
      setIsXConnected(true);
      setConnectingX(false);
    }, 2000);
  };

  const handleTaskAction = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isXConnected) return;

    // Open the task URL in a new window
    if (task.url) {
      window.open(task.url, '_blank');
    }

    // Mark task as completed (in real app, you'd verify completion)
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'completed' } : t
      ));
    }, 3000);
  };

  const handleClaimReward = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'completed') return;

    // Add reward to user coins (in real app, update via API)
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'claimed' } : t
    ));
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'twitter_follow': return '👤';
      case 'twitter_like': return '❤️';
      case 'twitter_retweet': return '🔄';
      case 'twitter_comment': return '💬';
      default: return '✓';
    }
  };

  const getTaskButtonText = (task: Task) => {
    if (!isXConnected) return 'Connect X first';
    
    switch (task.status) {
      case 'pending': return 'Complete';
      case 'completed': return `Claim ${task.reward} coins`;
      case 'claimed': return 'Claimed ✓';
      default: return 'Complete';
    }
  };

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Tasks</h2>
          <p className="text-gray-600 text-sm">Complete tasks to earn coins and rewards</p>
        </div>

        {/* Daily Spin Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">🎰</span>
              </div>
              <div>
                <h3 className="font-bold">Daily Spin Wheel</h3>
                <p className="text-purple-100 text-sm">
                  {spinsLeft > 0 ? `${spinsLeft} spins remaining today` : 'Come back tomorrow for more spins!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSpinModal(true)}
              disabled={spinsLeft <= 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                spinsLeft <= 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              {spinsLeft > 0 ? 'Spin' : 'No Spins'}
            </button>
          </div>
        </div>

        {/* X Connect Section */}
        <div className="bg-black rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">𝕏</span>
              </div>
              <div>
                <h3 className="font-bold">Connect X Account</h3>
                <p className="text-gray-300 text-sm">
                  {isXConnected ? 'Connected successfully!' : 'Connect to complete social tasks'}
                </p>
              </div>
            </div>
            <button
              onClick={handleXConnect}
              disabled={isXConnected || connectingX}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isXConnected 
                  ? 'bg-green-500 text-white cursor-default' 
                  : connectingX 
                    ? 'bg-gray-600 text-white cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {connectingX ? 'Connecting...' : isXConnected ? 'Connected ✓' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">Available Tasks</h3>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-50 rounded-xl p-4 border ${
                task.status === 'claimed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getTaskIcon(task.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm font-medium text-yellow-600">
                        🪙 {task.reward} wCHIBI
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'pending' ? 'bg-gray-200 text-gray-600' :
                        task.status === 'completed' ? 'bg-blue-200 text-blue-600' :
                        'bg-green-200 text-green-600'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => 
                    task.status === 'completed' 
                      ? handleClaimReward(task.id)
                      : handleTaskAction(task.id)
                  }
                  disabled={!isXConnected && task.status === 'pending' || task.status === 'claimed'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    task.status === 'claimed'
                      ? 'bg-green-200 text-green-600 cursor-default'
                      : task.status === 'completed'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : !isXConnected
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {getTaskButtonText(task)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'claimed').reduce((sum, t) => sum + t.reward, 0)}
              </div>
              <div className="text-sm text-gray-600">wCHIBI Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Wheel Modal */}
      {showSpinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Daily Spin Wheel</h3>
              <button
                onClick={() => setShowSpinModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-500 text-sm">✕</span>
              </button>
            </div>

            {/* Spins Counter */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {spinsLeft} spins remaining today
              </p>
            </div>

            {/* Spin Wheel */}
            <div className="relative mx-auto w-64 h-64">
              <div className="relative w-full h-full">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 200"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                  }}
                >
                  {spinRewards.map((reward, index) => {
                    const angle = (360 / spinRewards.length) * index;
                    const nextAngle = (360 / spinRewards.length) * (index + 1);
                    const x1 = 100 + 90 * Math.cos((angle * Math.PI) / 180);
                    const y1 = 100 + 90 * Math.sin((angle * Math.PI) / 180);
                    const x2 = 100 + 90 * Math.cos((nextAngle * Math.PI) / 180);
                    const y2 = 100 + 90 * Math.sin((nextAngle * Math.PI) / 180);
                    const textAngle = angle + (360 / spinRewards.length) / 2;
                    const textX = 100 + 60 * Math.cos((textAngle * Math.PI) / 180);
                    const textY = 100 + 60 * Math.sin((textAngle * Math.PI) / 180);

                    return (
                      <g key={reward.id}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                          fill={reward.color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY - 5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="12"
                          fill="#374151"
                          fontWeight="bold"
                        >
                          {reward.icon}
                        </text>
                        <text
                          x={textX}
                          y={textY + 8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="8"
                          fill="#374151"
                          fontWeight="medium"
                        >
                          {reward.label.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                </div>
                
                {/* Pointer */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-600 z-10"></div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="text-center space-y-3">
              <button
                onClick={handleSpin}
                disabled={spinsLeft <= 0 || isSpinning}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  spinsLeft <= 0 || isSpinning
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                }`}
              >
                {isSpinning ? 'Spinning...' : spinsLeft > 0 ? 'SPIN NOW!' : 'No spins left'}
              </button>

              {/* Result */}
              {spinResult && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-200">
                  <p className="font-bold text-lg text-gray-800">🎉 You won: {spinResult}!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
