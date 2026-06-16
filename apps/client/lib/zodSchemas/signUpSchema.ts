import { z } from 'zod';

export const SignUpFormSchema = z.object({
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, {
      message: 'Contain at least one number.',
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
});
