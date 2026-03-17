export { authEdge as middleware } from "@/auth-edge";

export const config = {
  matcher: ["/dashboard/:path*", "/invoices/:path*", "/create/:path*"]
};

