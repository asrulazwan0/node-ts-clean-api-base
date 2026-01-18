import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type UserDto = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type CreateUserInputDto = z.infer<typeof CreateUserInputSchema>;