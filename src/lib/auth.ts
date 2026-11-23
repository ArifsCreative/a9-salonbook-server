import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

import { mongoClient, mongoDb } from "./mongodb.js";

export const auth = betterAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: process.env.VERCEL ? "none" : "lax",
      secure: Boolean(process.env.VERCEL),
      httpOnly: true,
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },

      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
        }),
      },
    }),
  ],
});
