import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, RegisterPayload } from "@/api/auth";

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

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
