'use client';

import React, { useState } from 'react';
import { 
  GameButton, 
  GameProgressBar, 
  GameModal, 
  GameCard, 
  GameToast,
  useGameToast 
} from '@/components/game-ui';

export default function GameUIDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const { showToast, ToastContainer } = useGameToast();

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎮 Game UI Components</h1>
          <p className="text-gray-600">Beautiful, animated game UI elements for your Chiblets app</p>
        </div>

        {/* Game Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">🔘 Game Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GameButton variant="primary" onClick={() => showToast("Primary button clicked!", "info")}>
              Primary
            </GameButton>
            <GameButton variant="secondary" onClick={() => showToast("Secondary action!", "info")}>
              Secondary
            </GameButton>
            <GameButton variant="success" onClick={() => showToast("Success! 🎉", "success")}>
              Success
            </GameButton>
            <GameButton variant="danger" onClick={() => showToast("Danger zone!", "error")}>
              Danger
            </GameButton>
            <GameButton variant="legendary" onClick={() => showToast("LEGENDARY POWER! ⭐", "legendary")}>
              Legendary
            </GameButton>
          </div>
          
          {/* Different Sizes */}
          <div className="flex items-center space-x-4">
            <GameButton size="sm" variant="primary">Small</GameButton>
            <GameButton size="md" variant="primary">Medium</GameButton>
            <GameButton size="lg" variant="primary">Large</GameButton>
            <GameButton size="xl" variant="primary">Extra Large</GameButton>
          </div>
          
          {/* Special States */}
          <div className="flex items-center space-x-4">
            <GameButton loading variant="primary">Loading...</GameButton>
            <GameButton disabled variant="secondary">Disabled</GameButton>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">📊 Progress Bars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <GameProgressBar value={75} maxValue={100} type="health" />
              <GameProgressBar value={45} maxValue={100} type="energy" />
              <GameProgressBar value={88} maxValue={100} type="xp" />
              <GameProgressBar value={32} maxValue={100} type="mana" />
            </div>
            <div className="space-y-3">
              <GameProgressBar value={100} maxValue={100} type="health" size="lg" />
              <GameProgressBar value={15} maxValue={100} type="health" size="md" />
              <GameProgressBar value={60} maxValue={100} type="energy" size="sm" />
            </div>
          </div>
        </section>

        {/* Game Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">🎴 Game Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GameCard rarity="common" onClick={() => showToast("Common card selected", "info")}>
              <div className="text-center">
                <div className="text-3xl mb-2">🐸</div>
                <h3 className="font-bold">Common Frog</h3>
                <p className="text-xs text-gray-600">Basic creature</p>
              </div>
            </GameCard>
            
            <GameCard rarity="uncommon" onClick={() => showToast("Uncommon card selected", "success")}>
              <div className="text-center">
                <div className="text-3xl mb-2">🐺</div>
                <h3 className="font-bold">Swift Wolf</h3>
                <p className="text-xs text-gray-600">Fast attacker</p>
              </div>
            </GameCard>
            
            <GameCard rarity="rare" onClick={() => showToast("Rare card selected!", "success")}>
              <div className="text-center">
                <div className="text-3xl mb-2">🐉</div>
                <h3 className="font-bold">Fire Drake</h3>
                <p className="text-xs text-gray-600">Elemental beast</p>
              </div>
            </GameCard>
            
            <GameCard rarity="epic" glowing onClick={() => showToast("Epic card selected!!", "warning")}>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold">Thunder Lord</h3>
                <p className="text-xs text-gray-600">Storm master</p>
              </div>
            </GameCard>
            
            <GameCard rarity="legendary" glowing onClick={() => showToast("LEGENDARY CARD!!! 🌟", "legendary")}>
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h3 className="font-bold">Cosmic Entity</h3>
                <p className="text-xs text-gray-600">Godlike power</p>
              </div>
            </GameCard>
          </div>
        </section>

        {/* Modal Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">🪟 Game Modals</h2>
          <div className="flex space-x-4">
            <GameButton onClick={() => setModalOpen(true)}>Open Modal</GameButton>
          </div>
        </section>

        {/* Toast Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">🍞 Game Toasts</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GameButton onClick={() => showToast("Info message", "info")} variant="primary" size="sm">
              Info Toast
            </GameButton>
            <GameButton onClick={() => showToast("Success! Well done!", "success")} variant="success" size="sm">
              Success Toast
            </GameButton>
            <GameButton onClick={() => showToast("Warning! Be careful", "warning")} variant="secondary" size="sm">
              Warning Toast
            </GameButton>
            <GameButton onClick={() => showToast("Error occurred!", "error")} variant="danger" size="sm">
              Error Toast
            </GameButton>
            <GameButton onClick={() => showToast("LEGENDARY ACHIEVEMENT! 🎉", "legendary")} variant="legendary" size="sm">
              Legendary Toast
            </GameButton>
          </div>
        </section>

        {/* Combined Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">🎯 Combined Example</h2>
          <GameCard rarity="epic" size="lg" className="max-w-md mx-auto">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Battle Arena</h3>
                <p className="text-sm text-gray-600">Prepare for combat!</p>
              </div>
              
              <div className="space-y-2">
                <GameProgressBar value={120} maxValue={150} type="health" />
                <GameProgressBar value={80} maxValue={100} type="energy" />
                <GameProgressBar value={2450} maxValue={3000} type="xp" />
              </div>
              
              <div className="flex space-x-2">
                <GameButton variant="success" className="flex-1" onClick={() => showToast("Battle started! ⚔️", "success")}>
                  Fight!
                </GameButton>
                <GameButton variant="secondary" onClick={() => showToast("Fled from battle 💨", "warning")}>
                  Flee
                </GameButton>
              </div>
            </div>
          </GameCard>
        </section>

      </div>

      {/* Game Modal */}
      <GameModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="🎮 Game Modal Demo"
        variant="legendary"
        size="lg"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            This is a beautiful game-style modal with animated entrance effects!
          </p>
          
          <div className="space-y-3">
            <GameProgressBar value={85} maxValue={100} type="xp" />
            <div className="flex space-x-2">
              <GameButton variant="success" onClick={() => {
                showToast("Modal action completed! ✅", "success");
                setModalOpen(false);
              }}>
                Confirm
              </GameButton>
              <GameButton variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </GameButton>
            </div>
          </div>
        </div>
      </GameModal>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
