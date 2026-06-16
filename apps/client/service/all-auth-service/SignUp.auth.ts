"use server";

import { fetchGraphqlServer } from "@/lib/api/fetchGraphqlServer";
import { CREATE_USER_MUTATION } from "@/lib/graphql/auth";
import { SignUpFormSchema } from "@/lib/zodSchemas/signUpSchema";
import { SignFormState } from "@/types/formState";
import { print } from "graphql";
import { redirect } from "next/navigation";

interface SignUpGraphQLResponse {
  Signup?: {
    _id: string;
  };

  errors?: {
    message: string;
  }[];
}

export async function signUp(
  state: SignFormState,
  formData: FormData,
): Promise<SignFormState> {
  // 1. Validate form data with Zod
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = SignUpFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData as Record<string, string>,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // z.treeifyError(err)
  // 2. Call GraphQL sign-up mutation (server-side fetch)
  let response: SignUpGraphQLResponse;
  try {
    response = await fetchGraphqlServer<SignUpGraphQLResponse>(
      print(CREATE_USER_MUTATION),
      { createUserInput: validatedFields.data },
    );
  } catch {
    return {
      data: rawData as Record<string, string>,
      message: "unexpected error occurred. Please try again.",
    };
  }

  // 3. Handle GraphQL errors
  if (response.errors || !response.Signup) {
    return {
      data: rawData as Record<string, string>,
      message:
        response.errors?.[0]?.message ?? "Sign up failed. Please try again.",
    };
  }

  // 4. Redirect to sign-in page
  redirect("/auth/signin");
}
