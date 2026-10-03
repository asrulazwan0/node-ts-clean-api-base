import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').max(254),
    name: z.string().trim().min(1, 'Name is required').max(100),
  })
  .strict();
