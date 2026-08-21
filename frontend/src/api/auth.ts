import api from "@/lib/api";

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  signup: (name: string, email: string, password: string) =>
    api.post("/auth/signup", { name, email, password }),

  me: () =>
    api.get("/auth/me"),
};