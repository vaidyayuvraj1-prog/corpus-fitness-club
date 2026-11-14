import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const role = useAuthStore((s) => s.role);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const login = useAuthStore((s) => s.login);
  const demoLogin = useAuthStore((s) => s.demoLogin);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const isAuthenticated = !!session && !!user;
  const isAdmin = isAuthenticated && role === 'admin';
  const isTrainer = isAuthenticated && role === 'trainer';
  const isMember = isAuthenticated && role === 'member';

  return {
    user,
    session,
    profile,
    role,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isTrainer,
    isMember,
    login,
    demoLogin,
    logout,
    updateProfile,
  };
}
