// services/auth.service.ts
import api from "./api";

export const AuthService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
};
