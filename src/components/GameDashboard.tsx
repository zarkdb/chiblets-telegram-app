'use client';

import React from 'react';
import GameInterface from './GameInterface';

interface GameDashboardProps {
  user: any;
}

export default function GameDashboard({ user }: GameDashboardProps) {
  return <GameInterface user={user} />;
}
