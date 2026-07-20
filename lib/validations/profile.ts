import { z } from "zod";

/**
 * Mirrors the backend `updateUserZodSchema` (user.validation.ts). Only the
 * fields a customer may set are here — role/isActive/isDeleted/isVerified are
 * admin-only and the backend 403s if a USER sends them.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long.")
    .max(50, "Name cannot exceed 50 characters."),
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
});

export type ProfileValues = z.infer<typeof profileSchema>;

/** Mirrors the password rules in `createUserZodSchema`. */
const password = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter.")
  .regex(/(?=.*[!@#$%^&*])/, "Password must contain at least 1 special character.")
  .regex(/(?=.*\d)/, "Password must contain at least 1 number.");

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Your current password is required."),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "The new password must differ from your current one.",
    path: ["newPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
