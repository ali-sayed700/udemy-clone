"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/components/ui/form-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "@/service/all-auth-service/SignIn.auth";
import { signUp } from "@/service/all-auth-service/SignUp.auth";
import { LoginFormSchema } from "@/lib/zodSchemas/loginFormDchrma";
import { SignUpFormSchema } from "@/lib/zodSchemas/signUpSchema";

// Derive types from the shared Zod schemas
export type SignInFormData = z.infer<typeof LoginFormSchema>;
export type SignUpFormData = z.infer<typeof SignUpFormSchema>;

type AuthFormProps = { mode: "signin" } | { mode: "signup" };

function SubmitButton({
  isSignUp,
  isFormValid,
}: {
  isSignUp: boolean;
  isFormValid: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || !isFormValid} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isSignUp ? "Signing Up..." : "Signing In..."}
        </>
      ) : isSignUp ? (
        "Sign Up"
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "signup";

  // Choose the correct server action based on mode
  const action = isSignUp ? signUp : signIn;
  const [state, formAction] = useActionState(action, undefined);

  // Client-side validation for instant UX feedback
  const {
    register,
    formState: { errors: clientErrors, isValid },
  } = useForm<SignUpFormData | SignInFormData>({
    mode: "onChange",
    resolver: zodResolver(isSignUp ? SignUpFormSchema : LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignUp && { userName: "" }),
    },
  });

  // Merge: server-side errors take precedence when present
  const serverErrors = state?.errors;

  return (
    <form action={formAction} className="w-full space-y-4">
      {/* Server-level error message (e.g. "Invalid Credentials") */}
      {state?.message && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          {state.message}
        </div>
      )}

      {/* Success message */}
      {state?.success && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-400">
          {state.message}
        </div>
      )}

      {isSignUp && (
        <FormInput<SignUpFormData | SignInFormData>
          label="Username"
          name="userName"
          type="text"
          placeholder="Enter your username"
          register={register}
          error={serverErrors?.userName?.[0] ?? clientErrors?.userName?.message}
        />
      )}

      <FormInput<SignUpFormData | SignInFormData>
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        register={register}
        error={serverErrors?.email?.[0] ?? clientErrors.email?.message}
      />

      <FormInput<SignUpFormData | SignInFormData>
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        register={register}
        error={serverErrors?.password?.[0] ?? clientErrors.password?.message}
      />

      <SubmitButton isSignUp={isSignUp} isFormValid={isValid} />
    </form>
  );
}
