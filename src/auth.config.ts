import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: { error: '/login', signIn: '/login' }, // Redirect to login on error too
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup'))) {
                // Redirect logged in users to dashboard if they visit login/home
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
