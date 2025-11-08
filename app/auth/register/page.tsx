"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequestOtp, VerifyOtp, Register } from "@/utils/api/auth";
import { OtpInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getUserProfile } from "@/utils/api/user";

type RegisterStep = "phone" | "otp" | "details";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEthiopianPhone(phone)) {
      setError(
        "Please enter a valid Ethiopian phone number (9 digits starting with 9)"
      );
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await RequestOtp({ phone: `+251${cleanPhone}` });
      setStep("details");
    } catch (err: any) {
      setError(err.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await Register({
        firstName,
        lastName,
        phone: `+251${cleanPhone}`,
        password,
      });
      await getUserProfile();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-3">
            Create Account
          </h1>
          <p className="text-lg text-muted-foreground">Join us today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-10 gap-2">
          {[
            {
              num: 1,
              label: "Phone",
              active: step === "phone" || step === "details",
            },
            { num: 2, label: "Details", active: step === "details" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-semibold text-sm transition-colors ${
                  s.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-xs font-medium ${
                  s.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
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
                Enter your 9-digit Ethiopian phone number
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                First Name
              </label>
              <Input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Last Name
              </label>
              <Input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum 6 characters
              </p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:opacity-80 transition"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
