'use client';

// Build timestamp: 2025-01-08T19:17:40Z - Force fresh build
import { useAuth } from '@/components/AuthProvider';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import GameDashboard from '@/components/GameDashboard';

export default function HomePage() {
  const { user, loading, error, isAuthenticated } = useAuth();

  // Show loading screen while authenticating
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen if authentication failed
  if (error && !isAuthenticated) {
    return <ErrorScreen error={error} />;
  }

  // Show game dashboard if authenticated
  if (isAuthenticated && user) {
    return <GameDashboard user={user} />;
  }

  // Fallback - should not reach here normally
  return <LoadingScreen />;
}
