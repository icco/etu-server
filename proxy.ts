import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Use Edge-compatible auth config (no Prisma)
export const { auth: proxy } = NextAuth(authConfig)

export default proxy

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
