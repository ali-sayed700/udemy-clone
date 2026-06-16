import { logger } from "@/lib/logger";
import { GRAPHQL_ENDPOINT } from "../constants";
import { createSession, deleteSession, getSession } from "../session";

/**
 * Server-side only GraphQL fetch wrapper (no auth).
 * Intended for use inside Next.js Server Actions and Server Components.
 */
export async function fetchGraphqlServer<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const result = await res.json();
  if (result.errors) {
    throw new Error("Failed to fetch the data from GraphQL");
  }
  return result.data;
}

/**
 * Server-side GraphQL fetch wrapper with authentication.
 * Automatically attaches the user's access token from the session.
 */
export const authFetchGraphQL = async (query: string, variables = {}) => {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error(
      "Authentication failed: No access token. Please sign in again.",
    );
  }

  let response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    credentials: "include",
  });

  let result = await response.json();

  if (result.errors) {
    const errorMessages = result.errors
      .map((err: { message: string }) => err.message)
      .join("; ");

    const isExpired =
      errorMessages.toLowerCase().includes("jwt expired") ||
      errorMessages.toLowerCase().includes("unauthorized") ||
      errorMessages.toLowerCase().includes("access denied");

    if (isExpired && session.refreshToken) {
      try {
        const refreshResponse = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.refreshToken}`,
          },
          body: JSON.stringify({
            query: `
              mutation {
                refreshToken {
                  accessToken
                  refreshToken
                  userId
                  role
                  userName
                  avatar
                }
              }
            `,
          }),
        });

        const refreshResult = await refreshResponse.json();

        if (refreshResult.errors || !refreshResult.data?.refreshToken) {
          throw new Error("Refresh token invalid");
        }

        const newAuth = refreshResult.data.refreshToken;

        try {
          await createSession({
            accessToken: newAuth.accessToken,
            refreshToken: newAuth.refreshToken,
            user: {
              userId: newAuth.userId,
              userName: newAuth.userName,
              avatar: newAuth.avatar,
              role: newAuth.role,
            },
          });
        } catch (cookieErr) {
          logger.warn(
            "Could not set cookie in this context. It may be a server component render.",
            cookieErr as string,
          );
          throw new Error("Refresh token invalid");
        }

        // Replay original request
        response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAuth.accessToken}`,
          },
          body: JSON.stringify({
            query,
            variables,
          }),
          credentials: "include",
        });

        result = await response.json();

        if (result.errors) {
          throw new Error(
            `GraphQL Error after refresh: ${result.errors.map((e: { message: string }) => e.message).join("; ")}`,
          );
        }
      } catch {
        try {
          await deleteSession();
        } catch {}
        throw new Error("Session expired. Please sign in again.");
      }
    } else {
      throw new Error(`GraphQL Error: ${errorMessages}`);
    }
  }

  if (!result.data) {
    return {};
  }

  return result.data;
};
