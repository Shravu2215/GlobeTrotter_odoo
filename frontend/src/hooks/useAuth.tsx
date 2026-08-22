import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, RegisterPayload, UpdateProfilePayload } from "@/api/auth";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo?: string | null;
  language?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    payloadOrName: RegisterPayload | string,
    email?: string,
    password?: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const userData = res.data.data?.user || res.data.user;
        setUser(userData);
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    const token = res.data.data?.token || res.data.token;
    const userData = res.data.data?.user || res.data.user;
    localStorage.setItem("token", token);
    setUser(userData);
  }

  async function signup(
    payloadOrName: RegisterPayload | string,
    email?: string,
    password?: string
  ) {
    const res = await authApi.signup(payloadOrName, email, password);
    const token = res.data.data?.token || res.data.token;
    const userData = res.data.data?.user || res.data.user;
    if (token) {
      localStorage.setItem("token", token);
    }
    if (userData) {
      setUser(userData);
    }
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    const res = await authApi.updateProfile(payload);
    const updatedUser = res.data.data?.user || res.data.user || res.data;
    if (updatedUser) {
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
    }
  }

  async function deleteAccount() {
    try {
      await authApi.deleteAccount();
    } catch (e) {
      console.warn("deleteAccount endpoint failed or not found, continuing with local cleanup", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("globeTrotter_trips");
    localStorage.removeItem("globeTrotter_savedDestinations");
    setUser(null);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
