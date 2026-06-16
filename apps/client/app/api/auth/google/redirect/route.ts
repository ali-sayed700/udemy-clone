import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { API_URL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const userId = searchParams.get("userId");
  const userName = searchParams.get("name");
  const avatar = searchParams.get("avatar");

  if (!accessToken || !refreshToken || !userId || !userName)
    throw new Error("Google oauth failed!");

  const res = await fetch(`${API_URL}/api/verify-token`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) throw new Error("jwt verification failed!");

  await createSession({
    user: {
      userId,
      userName,
      avatar: avatar ?? undefined,
      //   role: role ?? 'student',
    },
    accessToken,
    refreshToken,
  });

  redirect("/");
}
