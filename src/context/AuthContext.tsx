import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

interface User {
  id: string;
  email: string;
  name?: string;
  balance?: number;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; user?: any; error?: any }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: any; error?: any }>;
  signOut: () => Promise<void>;
  userBalance: number;
  activeDevices: any[];
  devicesLoading: boolean;
  removeDevice: (deviceId: string) => Promise<void>;
  logoutFromAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [activeDevices, setActiveDevices] = useState<any[]>([]);
  const [devicesLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      const data = await authService.getDashboard();
      if (data) {
        setUser(data.user);
        setUserBalance(data.user.balance || 0);
        setActiveDevices(data.devices || []);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const initAuth = async () => {
    setLoading(true);
    // Check for user cookie first for immediate UI update
    const cookieUser = authService.getUserFromCookie();
    if (cookieUser) {
      setUser(cookieUser);
    }

    const result = await authService.checkAuth();
    if (result.valid && result.user) {
      setUser(result.user);
      await fetchUserData();
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await authService.signUp(email, password, name);
    if (result.success) {
      setUser(result.user || null);
      await fetchUserData();
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.success) {
      setUser(result.user || null);
      await fetchUserData();
    }
    return result;
  };

  const signOut = async () => {
    await authService.logoutFromAllDevices();
    authService.logout();
    setUser(null);
    setUserBalance(0);
  };

  const removeDevice = async (deviceId: string) => {
    const result = await authService.removeDevice(deviceId);
    if (result.success) {
      await fetchUserData();
    }
  };

  const logoutFromAllDevices = async () => {
    await authService.logoutFromAllDevices();
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
