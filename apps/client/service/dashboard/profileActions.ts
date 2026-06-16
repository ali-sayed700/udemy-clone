"use server";

import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";

import { GET_USER_QUERY, UPDATE_USER_MUTATION } from "@/lib/graphql/profile";

// ---- Actions ----

export async function getUserProfileAction(userId: string) {
  const result = await authFetchGraphQL(GET_USER_QUERY, { id: userId });
  return (result as { user: Record<string, unknown> }).user;
}

export async function updateProfileAction(data: {
  _id: string;
  userName?: string;
  avatar?: string;
  password?: string;
}) {
  const result = await authFetchGraphQL(UPDATE_USER_MUTATION, {
    updateUserInput: data,
  });
  return (result as { updateUser: Record<string, unknown> }).updateUser;
}
