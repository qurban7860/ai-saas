import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  process.env.SECRET ??
  (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined);

const { auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: authSecret,
  session: { strategy: "jwt" },
});

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  if (isApiAuthRoute) return;

  if (!isLoggedIn && !isAuthRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL("/chat", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
