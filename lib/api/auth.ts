import { api } from "@/lib/api";
import type {
  Account,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from "@/types/api";

export const authApi = {
  register(body: RegisterRequest) {
    return api.post<Account>("/api/auth/register", body, { skipAuth: true });
  },

  login(body: LoginRequest) {
    return api.post<AuthTokens>("/api/auth/login", body, { skipAuth: true });
  },

  refresh(refreshToken: string) {
    return api.post<AuthTokens>(
      "/api/auth/refresh",
      { refreshToken },
      { skipAuth: true },
    );
  },

  logout(refreshToken: string) {
    return api.post<void>("/api/auth/logout", { refreshToken });
  },

  forgotPassword(email: string) {
    return api.post<void>(
      "/api/accounts/forgot-password",
      { email },
      { skipAuth: true },
    );
  },

  resetPassword(token: string, newPassword: string) {
    return api.post<void>(
      "/api/accounts/reset-password",
      { token, newPassword },
      { skipAuth: true },
    );
  },
};
