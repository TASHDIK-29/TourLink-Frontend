"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getApiErrorMessage } from "@/lib/apiError";
import { profileSchema, type ProfileValues } from "@/lib/validations/profile";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { useLazyGetMeQuery } from "@/redux/features/auth/authApi";
import { useUpdateUserMutation } from "@/redux/features/user/userApi";
import type { IUser } from "@/types";

export function ProfileForm({ user }: { user: IUser }) {
  const dispatch = useAppDispatch();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [fetchMe] = useLazyGetMeQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateUser({
        id: user._id,
        payload: {
          name: values.name,
          // An empty phone fails the backend's Bangladeshi-number regex, so
          // omit it rather than sending "". (Clearing a saved number therefore
          // isn't possible through this form.)
          ...(values.phone ? { phone: values.phone } : {}),
          // Address has no format rule, so "" is accepted and does clear it.
          address: values.address ?? "",
        },
      }).unwrap();

      // Deliberately NOT using the PATCH response: it returns the raw Mongoose
      // document, bcrypt hash and all (the model has no `select: false` on
      // password). /user/me runs .select("-password"), so re-reading is both
      // safer and consistent with BookTourDialog.
      const me = await fetchMe().unwrap();
      dispatch(setUser(me));
      reset(values);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update your profile"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-card border border-border bg-card p-6"
    >
      <h2 className="font-semibold">Personal details</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A phone number and address are required before you can book a tour.
      </p>

      <div className="mt-5 space-y-4">
        <Input label="Full name" error={errors.name?.message} {...register("name")} />

        <Input
          label="Email"
          value={user.email}
          disabled
          readOnly
          hint="Your email can't be changed."
        />

        <Input
          label="Phone"
          placeholder="+8801XXXXXXXXX"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Textarea
          label="Address"
          rows={3}
          placeholder="House, road, area, city"
          error={errors.address?.message}
          {...register("address")}
        />
      </div>

      <Button type="submit" className="mt-6" loading={isLoading} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
