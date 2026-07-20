"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MailCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "./OtpInput";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  OTP_TTL_SECONDS,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/auth/otpApi";

/** Resend stays locked briefly so an impatient click doesn't spam the mailer. */
const RESEND_LOCK_SECONDS = 30;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") ?? "";
  // Register redirects with ?sent=1 after dispatching the first code, so we
  // don't send a second one just because the page mounted.
  const alreadySent = searchParams.get("sent") === "1";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [stage, setStage] = useState<"request" | "enter">(
    alreadySent && emailParam ? "enter" : "request",
  );
  const [secondsLeft, setSecondsLeft] = useState(alreadySent ? OTP_TTL_SECONDS : 0);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();

  // One ticking clock drives both the expiry readout and the resend lock.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const expired = stage === "enter" && secondsLeft <= 0;
  const canResend = secondsLeft <= OTP_TTL_SECONDS - RESEND_LOCK_SECONDS;

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error("Enter the email you registered with.");
      return;
    }
    try {
      await sendOtp({ email: email.trim() }).unwrap();
      setStage("enter");
      setOtp("");
      setInvalid(false);
      setSecondsLeft(OTP_TTL_SECONDS);
      toast.success("Code sent — check your inbox.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not send the code");
      // The backend rejects a resend once verified; that's good news, not an error.
      if (message.toLowerCase().includes("already verified")) {
        toast.success("This account is already verified — you can log in.");
        router.push(`/login?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      toast.error(message);
    }
  };

  const handleVerify = async (code?: string) => {
    const value = (code ?? otp).replace(/\s/g, "");
    if (value.length !== 6) {
      toast.error("Enter all six digits.");
      return;
    }
    try {
      await verifyOtp({ email: email.trim(), otp: value }).unwrap();
      toast.success("Email verified — you can log in now.");
      router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      setInvalid(true);
      toast.error(getApiErrorMessage(error, "That code didn't work"));
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
        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-5 w-5" />
        </span>

        <h1 className="text-2xl font-bold">Verify your email</h1>

        {stage === "request" ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              New accounts need to be verified before you can log in. We&apos;ll
              email you a six-digit code.
            </p>

            <div className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full"
                size="lg"
                loading={sending}
                onClick={handleSend}
              >
                Send verification code
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the six-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>

            <div className="mt-6 space-y-4">
              <OtpInput
                value={otp}
                onChange={(next) => {
                  setOtp(next);
                  setInvalid(false);
                }}
                onComplete={handleVerify}
                disabled={verifying || expired}
                invalid={invalid}
              />

              <p
                className="text-center text-sm text-muted-foreground"
                aria-live="polite"
              >
                {expired ? (
                  <span className="text-destructive">
                    That code has expired — request a new one.
                  </span>
                ) : (
                  <>
                    Code expires in{" "}
                    <span className="font-medium text-foreground">
                      {Math.floor(secondsLeft / 60)}:
                      {String(secondsLeft % 60).padStart(2, "0")}
                    </span>
                  </>
                )}
              </p>

              <Button
                className="w-full"
                size="lg"
                loading={verifying}
                disabled={expired}
                onClick={() => handleVerify()}
              >
                Verify email
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                loading={sending}
                disabled={!canResend && !expired}
                onClick={handleSend}
              >
                <RotateCcw className="h-4 w-4" />
                {canResend || expired
                  ? "Resend code"
                  : `Resend in ${secondsLeft - (OTP_TTL_SECONDS - RESEND_LOCK_SECONDS)}s`}
              </Button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
