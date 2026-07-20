"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";

const schema = z.object({
  email: z.string().email("Invalid email address format."),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: Values) => {
    try {
      await forgotPassword(values).unwrap();
      setSentTo(values.email);
    } catch (error) {
      // NOTE: this backend answers honestly — "User does not exist",
      // "User is not verified", "User is BLOCKED" — so it leaks whether an
      // address is registered. Surfacing the real message is the more useful
      // behaviour here; hiding it would need a backend change to match.
      toast.error(getApiErrorMessage(error, "Could not send the reset email"));
    }
  };

  if (sentTo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-card border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>,
            we&apos;ve sent a link to reset your password.
          </p>
          <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
            The link expires in 10 minutes. If it doesn&apos;t arrive, check
            your spam folder.
          </p>
          <Link href="/login" className="mt-6 block">
            <Button variant="outline" className="w-full">
              Back to log in
            </Button>
          </Link>
        </div>
      </motion.div>
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
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email on your account and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
