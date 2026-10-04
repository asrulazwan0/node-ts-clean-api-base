import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').max(254),
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(100)
      .refine((value) => !value.includes('\0'), 'Name must not contain NUL characters'),
  })
  .strict();
