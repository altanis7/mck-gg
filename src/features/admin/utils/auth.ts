import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWTPayload } from "../api/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;

// 비밀번호 검증
export function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD_HASH) {
    console.error("ADMIN_PASSWORD_HASH is not set");
    return false;
  }
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

// JWT 토큰 생성
export function generateToken(): string {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    role: "admin",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h", // 24시간 유효
  });
}

// JWT 토큰 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 쿠키에서 토큰 추출
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies["admin_token"] || null;
}
