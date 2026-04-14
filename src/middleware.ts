import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  const isPublicRoute = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/features") || req.nextUrl.pathname.startsWith("/pricing") || req.nextUrl.pathname.startsWith("/about");

  if (isApiAuthRoute) return;

  if (!isLoggedIn && !isAuthRoute && !isPublicRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL("/chat", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
