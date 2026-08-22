import api from "@/lib/api";

export interface RegisterPayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  email: string;
  password?: string;
  phone?: string;
  city?: string;
  country?: string;
  photo?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo?: string | null;
  language?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  signup: (payload: RegisterPayload | string, email?: string, password?: string) => {
    if (typeof payload === "object") {
      return api.post("/auth/signup", payload);
    }
    return api.post("/auth/signup", { name: payload, email, password });
  },

  me: () =>
    api.get("/users/me"),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch("/users/me", payload),

  deleteAccount: () =>
    api.delete("/users/me"),
};