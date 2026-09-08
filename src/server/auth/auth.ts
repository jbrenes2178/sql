import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { createId } from "@/lib/ids";
import { prisma } from "@/server/db/prisma";
import { getEnv } from "@/server/env";
import { hashPassword, verifyBetterAuthPassword } from "@/server/auth/password";
import { logger } from "@/server/logging/logger";

function authOptions() {
  const env = getEnv();
  const baseURL = env.BETTER_AUTH_URL ?? env.APP_URL;
  return {
    appName: "optica-cr",
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: [baseURL],
    database: prismaAdapter(prisma, { provider: "postgresql" as const }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
      password: {
        hash: hashPassword,
        verify: verifyBetterAuthPassword,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    user: {
      additionalFields: {
        active: {
          type: "boolean" as const,
          required: true,
          defaultValue: true,
          input: false,
        },
        organizationId: {
          type: "string" as const,
          required: true,
          input: false,
        },
        defaultBranchId: {
          type: "string" as const,
          required: false,
          input: false,
        },
      },
    },
    advanced: {
      database: {
        generateId: () => createId(),
      },
      useSecureCookies: process.env.NODE_ENV === "production",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session: { userId: string }) => {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { active: true },
            });
            if (!user?.active) {
              logger.warn("auth.session_blocked_inactive", {
                module: "auth",
                action: "session.create",
                userId: session.userId,
              });
              throw new APIError("FORBIDDEN", {
                message: "La cuenta está deshabilitada.",
              });
            }
            return { data: session };
          },
        },
      },
    },
    plugins: [nextCookies()],
  };
}

export const auth = betterAuth(authOptions());
