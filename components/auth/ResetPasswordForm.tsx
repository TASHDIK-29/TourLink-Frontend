"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";

/** Mirrors the password rules in the backend's createUserZodSchema. */
const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter.")
      .regex(
        /(?=.*[!@#$%^&*])/,
        "Password must contain at least 1 special character.",
      )
      .regex(/(?=.*\d)/, "Password must contain at least 1 number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Both are put in the URL by the emailed link built in auth.service.
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: Values) => {
    if (!id || !token) return;
    try {
      await resetPassword({
        id,
        newPassword: values.newPassword,
        token,
      }).unwrap();

      toast.success("Password updated — you can log in now.");
      router.replace("/login");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not reset your password. The link may have expired.",
        ),
      );
    }
  };

  // A link that lost its query string (or was hand-typed) can't be actioned.
  if (!id || !token) {
    return (
      <div className="w-full max-w-md rounded-card border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">This link isn&apos;t valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open the most recent reset link from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="mt-6 block">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="rounded-card border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose something you haven&apos;t used before. This link expires 10
          minutes after it was sent.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Reset password
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
