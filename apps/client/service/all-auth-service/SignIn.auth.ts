"use server";

import { fetchGraphqlServer } from "@/lib/api/fetchGraphqlServer";
import { SIGN_IN_MUTATION } from "@/lib/graphql/auth";
import { createSession } from "@/lib/session";
import { LoginFormSchema } from "@/lib/zodSchemas/loginFormDchrma";
import { SignFormState } from "@/types/formState";
import { print } from "graphql";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface SignInGraphQLResponse {
  signIn?: {
    userId: string;
    userName: string;
    avatar: string;
    accessToken: string;
    refreshToken: string;
    role: string;
  };
  errors?: {
    message: string;
  }[];
}

export async function signIn(
  state: SignFormState,
  formData: FormData,
): Promise<SignFormState> {
  // 1. Validate form data with Zod
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = LoginFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData as Record<string, string>,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Call GraphQL sign-in mutation (server-side fetch)
  let response: SignInGraphQLResponse;

  try {
    response = await fetchGraphqlServer<SignInGraphQLResponse>(
      print(SIGN_IN_MUTATION),
      { input: validatedFields.data },
    );
  } catch {
    return {
      data: rawData as Record<string, string>,
      message: "An unexpected error occurred. Please try again.",
    };
  }

  // 3. Handle GraphQL errors
  if (response.errors || !response.signIn) {
    return {
      data: rawData as Record<string, string>,
      message: response.errors?.[0]?.message ?? "Invalid Credentials",
    };
  }

  // 4. Create httpOnly cookie session — token never reaches the browser
  const { accessToken, refreshToken, userId, userName, avatar, role } =
    response.signIn;

  await createSession({
    user: { userId, userName, avatar, role },
    accessToken,
    refreshToken,
  });

  // 5. Redirect to home
  revalidatePath("/");
  redirect("/");
}
