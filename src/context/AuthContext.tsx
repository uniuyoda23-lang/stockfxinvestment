import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { loginUser, registerUser, SupabaseUser } from '../lib/supabaseAuth';
import { useSessionSync, useActiveDevices, useLogoutDetection } from '../hooks/useSessionSync';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ user: SupabaseUser | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: SupabaseUser | null; error: any }>;
  signOut: () => Promise<void>;
  userBalance: number;
  activeDevices: any[];
  devicesLoading: boolean;
  removeDevice: (deviceId: string) => Promise<void>;
  logoutFromAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);

  // Get active devices for current user
  const { devices: activeDevices, loading: devicesLoading, removeDevice } = useActiveDevices(user?.id);

  // Setup session sync and logout detection
  const { isLoggedOut } = useLogoutDetection(user?.id);

  useSessionSync({
    userId: user?.id,
    onSessionChange: async (event) => {
      if (event.event_type === 'session_sync' && event.event_data?.data) {
        // Handle session data sync from other devices
        console.log('Session synced from another device:', event.event_data.data);
      }
    },
    onLogout: () => {
      // User was logged out from another device
      setUser(null);
      setUserBalance(0);
      console.log('Logged out from another device');
    },
  });

  // Check if logged out from another device
  useEffect(() => {
    if (isLoggedOut) {
      setUser(null);
      setUserBalance(0);
    }
  }, [isLoggedOut]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch full user profile from database
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              balance: userData.balance || 0,
              createdAt: userData.createdAt,
              status: userData.status,
              registrationStatus: userData.registrationStatus,
              updated_at: userData.updated_at,
            });
            setUserBalance(userData.balance || 0);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            balance: userData.balance || 0,
            createdAt: userData.createdAt,
            status: userData.status,
            registrationStatus: userData.registrationStatus,
            updated_at: userData.updated_at,
          });
          setUserBalance(userData.balance || 0);
        }
      } else {
        setUser(null);
        setUserBalance(0);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await registerUser(email, password, name);
      if (result.user) {
        setUser(result.user);
        setUserBalance(result.user.balance || 0);
      }
      return result;
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result.user) {
        setUser(result.user);
        setUserBalance(result.user.balance || 0);
      }
      return result;
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserBalance(0);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const logoutFromAllDevices = async () => {
    try {
      // This will trigger logout on all devices via the session_events
      await supabase.auth.signOut();
      setUser(null);
      setUserBalance(0);
    } catch (err) {
      console.error('Error logging out from all devices:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      userBalance,
      activeDevices,
      devicesLoading,
      removeDevice,
      logoutFromAllDevices,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
