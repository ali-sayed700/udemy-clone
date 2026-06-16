import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { API_URL } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const token = session?.accessToken;

    const body = await req.json();

    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.errors) {
      return NextResponse.json(data, { status: 400 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Internal Server Error" }] },
      { status: 500 },
    );
  }
}
