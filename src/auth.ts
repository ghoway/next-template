import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function getDaysFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

const accessTokenDays = getDaysFromEnv("ACCESS_TOKEN_DAYS", 3);
const refreshTokenDays = getDaysFromEnv("REFRESH_TOKEN_DAYS", 7);
const dayMs = 24 * 60 * 60 * 1000;
const jwtIssuer = "next-template-auth";
const jwtAudience = "next-template-clients";

function getJwtSecret() {
  const value = process.env.AUTH_JWT_SECRET ?? process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_JWT_SECRET or AUTH_SECRET must be configured.");
  }
  return new TextEncoder().encode(value);
}

async function createSignedToken(payload: {
  userId: string;
  name: string;
  email: string;
  role: string;
  tokenType: "access" | "refresh";
  expiresIn: string;
}) {
  const secret = getJwtSecret();
  return new SignJWT({
    user: {
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
    tokenType: payload.tokenType,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuer(jwtIssuer)
    .setAudience(jwtAudience)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(payload.expiresIn)
    .sign(secret);
}

async function verifyRefreshToken(token: string) {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret, {
      issuer: jwtIssuer,
      audience: jwtAudience,
    });

    if (verified.payload.tokenType !== "refresh") {
      return null;
    }

    return verified.payload;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: refreshTokenDays * 24 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.AUTH_SECRET ?? "dev-only-secret-change-me",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: parsed.data.email,
            deletedAt: null,
          },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = compareSync(
          parsed.data.password,
          user.hashedPassword,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userId =
          typeof user.id === "string"
            ? user.id
            : typeof token.id === "string"
              ? token.id
              : crypto.randomUUID();
        const userRole = typeof user.role === "string" ? user.role : "VIEWER";
        const userName = typeof user.name === "string" ? user.name : "";
        const userEmail = typeof user.email === "string" ? user.email : "";
        token.id = userId;
        token.role = userRole;
        token.name = userName;
        token.email = userEmail;
        token.accessToken = await createSignedToken({
          userId,
          name: userName,
          email: userEmail,
          role: userRole,
          tokenType: "access",
          expiresIn: `${accessTokenDays}d`,
        });
        token.refreshToken = await createSignedToken({
          userId,
          name: userName,
          email: userEmail,
          role: userRole,
          tokenType: "refresh",
          expiresIn: `${refreshTokenDays}d`,
        });
        token.accessTokenExpiresAt = Date.now() + accessTokenDays * dayMs;
        token.refreshTokenExpiresAt = Date.now() + refreshTokenDays * dayMs;
        token.tokenError = undefined;
      }

      const accessTokenExpiresAt =
        typeof token.accessTokenExpiresAt === "number"
          ? token.accessTokenExpiresAt
          : 0;
      const refreshTokenExpiresAt =
        typeof token.refreshTokenExpiresAt === "number"
          ? token.refreshTokenExpiresAt
          : 0;
      const hasRefreshToken = typeof token.refreshToken === "string";

      if (
        accessTokenExpiresAt > 0 &&
        Date.now() > accessTokenExpiresAt
      ) {
        if (
          hasRefreshToken &&
          refreshTokenExpiresAt > 0 &&
          Date.now() <= refreshTokenExpiresAt
        ) {
          const verifiedRefresh = await verifyRefreshToken(token.refreshToken as string);
          if (verifiedRefresh && verifiedRefresh.sub === String(token.id)) {
            const refreshUser =
              typeof verifiedRefresh.user === "object" &&
              verifiedRefresh.user !== null
                ? (verifiedRefresh.user as {
                    name?: unknown;
                    email?: unknown;
                    role?: unknown;
                  })
                : null;
            const refreshName =
              typeof refreshUser?.name === "string"
                ? refreshUser.name
                : String(token.name ?? "");
            const refreshEmail =
              typeof refreshUser?.email === "string"
                ? refreshUser.email
                : String(token.email ?? "");
            const refreshRole =
              typeof refreshUser?.role === "string"
                ? refreshUser.role
                : String(token.role ?? "VIEWER");

            token.accessToken = await createSignedToken({
              userId: String(token.id),
              name: refreshName,
              email: refreshEmail,
              role: refreshRole,
              tokenType: "access",
              expiresIn: `${accessTokenDays}d`,
            });
            token.accessTokenExpiresAt = Date.now() + accessTokenDays * dayMs;
            token.tokenError = undefined;
          } else {
            token.tokenError = "RefreshTokenInvalid";
          }
        } else {
          token.tokenError = "RefreshTokenExpired";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as typeof session.user.role;
      }
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : null;
      session.refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : null;
      session.accessTokenExpiresAt =
        typeof token.accessTokenExpiresAt === "number"
          ? token.accessTokenExpiresAt
          : null;
      session.refreshTokenExpiresAt =
        typeof token.refreshTokenExpiresAt === "number"
          ? token.refreshTokenExpiresAt
          : null;
      session.tokenError = typeof token.tokenError === "string" ? token.tokenError : null;
      return session;
    },
  },
});
