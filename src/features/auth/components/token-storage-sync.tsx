"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function TokenStorageSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("auth_tokens");
      return;
    }

    if (session.tokenError === "RefreshTokenExpired" || session.tokenError === "RefreshTokenInvalid") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("auth_tokens");
      return;
    }

    if (typeof session.accessToken === "string" && session.accessToken.length > 0) {
      localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    if (typeof session.refreshToken === "string" && session.refreshToken.length > 0) {
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    localStorage.removeItem("auth_tokens");
  }, [session]);

  return null;
}
