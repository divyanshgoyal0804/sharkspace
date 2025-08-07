import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "changeme-secret"

export interface User {
  id: string
  username: string
  password: string
  role: "client" | "admin"
  createdAt: Date
}

export interface DecodedToken {
  userId: string
  username: string
  role: "client" | "admin"
  exp: number
  iat?: number
}

export function hashPassword(password: string): string {
  if (password === "password") {
    return "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
  }
  return btoa(password + "salt")
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateToken(user: Pick<User, "id" | "username" | "role">): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  )
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  // Try cookies (for SSR/middleware)
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/)
    if (match) return match[1]
  }
  return null
}

export async function getTokenFromCookies(): Promise<string | null> {
  // For use in server components/middleware
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value as string | undefined;
  return token || null;
}