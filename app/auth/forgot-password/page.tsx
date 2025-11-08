"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForgotPassword } from "@/utils/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type ForgotPasswordStep = "phone" | "sent";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEthiopianPhone = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return cleanPhone.length === 9 && cleanPhone.startsWith("9");
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return `+251${cleanPhone}`;
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    if (!cleaned) return "";
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEthiopianPhone(phone)) {
      setError("Please enter a valid Ethiopian phone number");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await ForgotPassword({ phone: `+251${cleanPhone}` });
      setStep("sent");
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-3">
            Reset Password
          </h1>
          <p className="text-lg text-muted-foreground">Recover your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  +251
                </span>
                <Input
                  type="tel"
                  placeholder="912 345 678"
                  value={formatPhoneInput(phone)}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                  className="pl-14 h-12 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter your Ethiopian phone number
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        )}

        {step === "sent" && (
          <div className="space-y-8 text-center">
            <div className="py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">
                Reset code sent!
              </p>
              <p className="text-muted-foreground">
                We've sent a reset code to {formatPhoneDisplay(phone)}
              </p>
            </div>
            <Link
              href={`/auth/reset-password?phone=${formatPhoneDisplay(phone)}`}
            >
              <Button className="w-full h-12 text-base font-semibold rounded-lg">
                Enter Reset Code
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => {
                setPhone("");
                setStep("phone");
              }}
              className="text-primary text-sm font-semibold hover:opacity-80 transition w-full"
            >
              Try another phone number
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-primary text-sm font-semibold hover:opacity-80 transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
