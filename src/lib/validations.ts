import { z } from 'zod';

// Auth schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

export const passwordSchema = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters' })
  .max(72, { message: 'Password must be less than 72 characters' });

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must be less than 100 characters' });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Reminder schema
export const reminderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Description must be less than 1000 characters' })
    .optional(),
  reminderTime: z
    .string()
    .min(1, { message: 'Reminder time is required' })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Invalid date/time',
    }),
});

// Image generation schema
export const imageGenerationSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3, { message: 'Prompt must be at least 3 characters' })
    .max(2000, { message: 'Prompt must be less than 2000 characters' }),
});

// Translation schema
export const translationSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: 'Text is required' })
    .max(5000, { message: 'Text must be less than 5000 characters' }),
  sourceLang: z.enum(['en', 'hi', 'hinglish']),
  targetLang: z.enum(['en', 'hi', 'hinglish']),
});

// Settings schema
export const settingsSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(100, { message: 'Name must be less than 100 characters' }),
  voice_enabled: z.boolean(),
  voice_speed: z.number().min(0.5).max(2.0),
  language_preference: z.enum(['en', 'hi', 'hinglish']),
});

// Helper to extract first error message
export const getFirstError = (error: z.ZodError): string => {
  return error.errors[0]?.message || 'Validation failed';
};
