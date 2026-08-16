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

  /**
   * Đổi ID token của Google lấy token của chính hệ thống.
   *
   * Trình duyệt nhận ID token thẳng từ Google nên không có redirect URI nào dính
   * tới API — điều đó quan trọng ở đây vì API đi qua tunnel có tên miền thay đổi.
   * Google chỉ cần biết origin của frontend.
   */
  loginWithGoogle(credential: string) {
    return api.post<AuthTokens>(
      "/api/auth/google",
      { credential },
      { skipAuth: true },
    );
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
