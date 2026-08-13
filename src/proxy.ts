import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Ucuz ön kontrol: oturum çerezi yoksa admin sayfası hiç render edilmez.
// Rol kontrolü burada yapılamaz (çerez yalnızca varlık bildirir) — gerçek
// yetki kontrolü admin layout'undaki requireAdmin() ile yapılır.
const ADMIN_PATHS: string[] = ["/admin"];
const AUTH_PATHS = ["/hesabim"];
const AUTH_PAGES = ["/giris", "/kayit"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!isAuthenticated && (isAdminPath || isAuthPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
