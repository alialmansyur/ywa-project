import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';

export function useMechanicAccessGuard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const isRestrictedRole = useMemo(() => {
    const roleName = String(user?.role || '').toLowerCase();
    return roleName === 'driver' || roleName.includes('operator');
  }, [user?.role]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.id) return;
    if (!isRestrictedRole) return;
    router.replace('/(tabs)/profile');
  }, [isRestrictedRole, isAuthenticated, isLoading, user?.id]);

  return { isRestrictedRole };
}
