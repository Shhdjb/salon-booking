import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/phone-utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use request Host (incl. port) for redirects — avoids wrong port when AUTH_URL is 3000 but dev runs on 3001+.
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailOrPhone = credentials?.email as string;
        if (!emailOrPhone || !credentials?.password) return null;

        const trimmed = emailOrPhone.trim();
        let user = trimmed.includes("@")
          ? await prisma.user.findUnique({ where: { email: trimmed } })
          : await prisma.user.findFirst({ where: { phone: trimmed } });
        if (!user && !trimmed.includes("@") && isValidPhone(trimmed)) {
          const e164 = normalizePhone(trimmed);
          user = await prisma.user.findFirst({ where: { phone: e164 } });
        }

        if (!user || !user.passwordHash || user.deletedAt) return null;

        const isValid = await compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email || user.phone || "",
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
