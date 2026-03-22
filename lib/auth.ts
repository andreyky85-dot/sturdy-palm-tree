import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";

/**
 * Опциональный провайдер только для Playwright E2E: без Google OAuth.
 * Включается строго по флагу и запрещён на Vercel, чтобы случайно не открыть лазейку в проде.
 */
function buildE2eCredentialsProvider() {
  if (process.env.ENABLE_E2E_CREDENTIALS !== "true") {
    return null;
  }
  if (process.env.VERCEL === "1") {
    throw new Error(
      "[auth] ENABLE_E2E_CREDENTIALS нельзя включать на Vercel — это обход OAuth для тестов."
    );
  }
  const email = process.env.E2E_AUTH_EMAIL?.trim();
  const password = process.env.E2E_AUTH_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.warn(
      "[auth] ENABLE_E2E_CREDENTIALS=true, но нужны E2E_AUTH_EMAIL и E2E_AUTH_PASSWORD (≥8 символов). Провайдер E2E не зарегистрирован."
    );
    return null;
  }
  return CredentialsProvider({
    id: "e2e",
    name: "E2E",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (
        !credentials?.email ||
        !credentials?.password ||
        credentials.email !== email ||
        credentials.password !== password
      ) {
        return null;
      }
      // id обязателен для типа User; jwt-колбэк заменит на cuid из Prisma после upsert.
      return { id: email, email, name: "E2E User" };
    },
  });
}

const e2eProvider = buildE2eCredentialsProvider();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(e2eProvider ? [e2eProvider] : []),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      // При входе синхронизируем профиль в БД и кладём в JWT стабильный cuid — лимиты и Generation привязаны к нему.
      if (user?.email) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
            update: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            },
          });
          token.id = dbUser.id;
          token.email = dbUser.email;
        } catch (err) {
          console.error("[auth] prisma.user.upsert", err);
        }
      } else if (token.email && !token.id) {
        // Старые JWT после внедрения Prisma: подтянуть id по email без повторного логина.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        } catch (err) {
          console.error("[auth] prisma.user.findUnique", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          (session.user as { id?: string }).id = token.id as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
    async signIn({ user }) {
      return !!user?.email;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
