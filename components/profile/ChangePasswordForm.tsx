"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validations/profile";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";

export function ChangePasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      reset();
      toast.success("Password changed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not change your password"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-card border border-border bg-card p-6"
    >
      <h2 className="font-semibold">Password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use at least 8 characters with an uppercase letter, a number and a
        special character.
      </p>

      <div className="mt-5 space-y-4">
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={errors.oldPassword?.message}
          {...register("oldPassword")}
        />
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
      </div>

      <Button type="submit" variant="outline" className="mt-6" loading={isLoading}>
        Change password
      </Button>
    </form>
  );
}
