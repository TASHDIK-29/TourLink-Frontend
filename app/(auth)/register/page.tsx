import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GuestGuard } from "@/components/auth/GuestGuard";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
