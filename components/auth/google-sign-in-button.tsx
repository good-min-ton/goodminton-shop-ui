"use client";

import { useCallback, useRef } from "react";
import Script from "next/script";
import { useGoogleLogin } from "@/hooks/use-auth";

/**
 * Chỉ khai báo phần API của Google Identity Services mà chỗ này dùng tới, thay
 * vì kéo về cả gói @types/google.accounts cho ba hàm.
 */
interface GoogleIdApi {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "small" | "medium" | "large";
          text?: "signin_with" | "signup_with" | "continue_with";
          shape?: "rectangular" | "pill";
          logo_alignment?: "left" | "center";
          width?: number;
          locale?: string;
        },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdApi;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleSignInButtonProps {
  /** Nơi quay về sau khi đăng nhập, giữ nguyên tham số ?next= của trang. */
  redirectTo?: string;
  text?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({
  redirectTo,
  text = "continue_with",
}: Readonly<GoogleSignInButtonProps>) {
  const boxRef = useRef<HTMLDivElement>(null);
  const googleLogin = useGoogleLogin();

  // Giữ trong ref để callback đưa cho Google không bị đóng gói mất phiên bản cũ
  // của mutation: initialize chỉ chạy một lần cho mỗi lần mount, còn hàm callback
  // thì Google giữ lại và gọi sau đó rất lâu.
  const loginRef = useRef(googleLogin);
  loginRef.current = googleLogin;

  const redirectRef = useRef(redirectTo);
  redirectRef.current = redirectTo;

  const setup = useCallback(() => {
    const api = window.google;
    if (!api || !boxRef.current || !CLIENT_ID) return;

    api.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: ({ credential }) => {
        if (!credential) return;
        loginRef.current.mutate({ credential, redirectTo: redirectRef.current });
      },
      // Không tự chọn tài khoản: đăng nhập là việc người dùng phải chủ động, nhất
      // là trên máy dùng chung.
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Nút do Google tự dựng trong một iframe. Không thể thay bằng nút của mình:
    // ID token chỉ được cấp cho luồng do chính thư viện của Google khởi tạo.
    api.accounts.id.renderButton(boxRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "center",
      width: 320,
      locale: "vi",
    });
  }, [text]);

  // Không cấu hình client id thì không dựng gì cả: một nút bấm vào là lỗi còn tệ
  // hơn là không có nút.
  if (!CLIENT_ID) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium tracking-wide text-stone-400 uppercase">
          hoặc
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="flex justify-center">
        {/* Chiều cao cố định để nút của Google xuất hiện không làm nhảy bố cục. */}
        <div ref={boxRef} className="min-h-[44px]" />
      </div>

      {/* onReady chứ không phải onLoad: onLoad chỉ chạy lần tải đầu tiên, còn
          onReady chạy lại sau mỗi lần component mount — mà renderButton cần
          được gọi lại mỗi lần vì phần tử chứa nút là mới. */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={setup}
      />
    </div>
  );
}
