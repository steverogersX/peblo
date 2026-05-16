import { request } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<{ user: AuthUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<unknown>("/api/auth/logout", { method: "POST" }),

  me: () =>
    request<{ user: AuthUser }>("/api/auth/me"),

  deleteAccount: () =>
    request<unknown>("/api/auth/account", { method: "DELETE" }),
};
