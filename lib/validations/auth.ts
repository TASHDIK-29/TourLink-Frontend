import { z } from "zod";

/**
 * Mirrors backend `createUserZodSchema` (user.validation.ts) so the user gets
 * the same rules client-side. Keep these in sync if the backend changes.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long.")
      .max(50, "Name cannot exceed 50 characters."),
    email: z
      .string()
      .min(5, "Email must be at least 5 characters long.")
      .max(100, "Email cannot exceed 100 characters.")
      .email("Invalid email address format."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter.")
      .regex(/(?=.*[!@#$%^&*])/, "Password must contain at least 1 special character.")
      .regex(/(?=.*\d)/, "Password must contain at least 1 number."),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(
        /^(?:\+8801\d{9}|01\d{9})$/,
        "Use a valid Bangladeshi number: +8801XXXXXXXXX or 01XXXXXXXXX.",
      )
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(200, "Address cannot exceed 200 characters.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address format."),
  password: z.string().min(1, "Password is required."),
});

export type LoginValues = z.infer<typeof loginSchema>;
