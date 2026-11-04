import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '@/domain/password';

export const signUpSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export type ResetPasswordRequestValues = z.infer<typeof resetPasswordRequestSchema>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
