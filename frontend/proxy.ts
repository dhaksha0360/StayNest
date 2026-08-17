import { NextRequest, NextResponse } from "next/server";
const managerOnly = [
  "/dashboard/calendar",
  "/dashboard/analytics",
  "/dashboard/guests",
  "/dashboard/payments",
  "/dashboard/properties",
];
export function proxy(request: NextRequest) {
  const session = request.cookies.get("staynest_session");
  const role = request.cookies.get("staynest_role")?.value;
  const path = request.nextUrl.pathname;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  if (path.startsWith("/dashboard/admin") && role !== "admin")
    return NextResponse.redirect(new URL("/dashboard", request.url));
  if (
    managerOnly.some((x) => path.startsWith(x)) &&
    !["manager", "admin"].includes(role ?? "")
  )
    return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*", "/checkout"] };
