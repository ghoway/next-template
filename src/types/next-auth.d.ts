import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roleLevel: number;
    } & DefaultSession["user"];
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: number | null;
    refreshTokenExpiresAt: number | null;
    tokenError: string | null;
  }

  interface User {
    role: string;
    roleLevel: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roleLevel?: number;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    tokenError?: string;
  }
}
