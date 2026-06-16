"use server";
import { logger } from "@/lib/logger";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
  userId?: string;
  userName?: string;
  avatar?: string;
  role?: string;
};

export type Session = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  const session = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiredAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as Session;
  } catch (err) {
    logger.error("Failed to verify the session: ", err as Error);
    redirect("/auth/sginin");
  }
}

export async function updateSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;

  // Re-sign with fresh expiry
  await createSession(session);
  return session;
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
