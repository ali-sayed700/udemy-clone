import { z } from "zod";

export const LoginFormSchema = z.object({
  userName: z.string().min(1).optional(),
  email: z.email(),
  password: z.string().min(1),
});
