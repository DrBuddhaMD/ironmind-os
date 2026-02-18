import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log("Searching for user:", email);

                    try {
                        // 'email' field maps to username in our DB schema currently
                        const user = await prisma.user.findUnique({ where: { username: email } });
                        console.log("User found:", user ? "YES" : "NO");

                        if (!user) {
                            console.log("User not found via search");
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        console.log("Password match:", passwordsMatch);

                        if (passwordsMatch) return { id: user.id, name: user.username, email: user.username, role: user.role };
                    } catch (e) {
                        console.error("Auth process error:", e);
                        throw e;
                    }
                } else {
                    console.log("Zod validation failed");
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
    },
    secret: process.env.AUTH_SECRET,
});
