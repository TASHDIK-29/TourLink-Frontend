"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { useSendOtpMutation } from "@/redux/features/auth/otpApi";
import { getApiErrorMessage } from "@/lib/apiError";

export function RegisterForm() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    // confirmPassword is a client-only check — don't send it. Blank optionals
    // are dropped too, since "" would fail the backend's phone/address regexes.
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      ...(values.phone ? { phone: values.phone } : {}),
      ...(values.address ? { address: values.address } : {}),
    };

    try {
      await registerUser(payload).unwrap();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create your account"));
      return;
    }

    // New users are created with isVerified: false and the login strategy
    // rejects them outright, so send the code immediately and hand off to
    // /verify rather than dropping them at a login they cannot pass.
    const email = encodeURIComponent(values.email);
    try {
      await sendOtp({ email: values.email, name: values.name }).unwrap();
      toast.success("Account created — check your email for a code.");
      router.push(`/verify?email=${email}&sent=1`);
    } catch {
      // The account exists either way; let them request the code manually.
      toast.success("Account created. Request a code to verify your email.");
      router.push(`/verify?email=${email}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="rounded-card border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start planning your next trip in minutes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            hint="At least 8 characters, with a number, an uppercase letter and a special character."
            {...register("password")}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Address (optional)"
            autoComplete="street-address"
            placeholder="Dhanmondi, Dhaka"
            error={errors.address?.message}
            hint="Needed later to complete a booking — you can add it any time."
            {...register("address")}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoading || sendingOtp}
          >
            Create account
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
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
