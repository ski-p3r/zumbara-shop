"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/providers/language-provider";
import { resetPassword } from "@/utils/api/auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function OtpPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    // Focus next input if value entered
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
    // Focus previous input if deleted
    if (!value && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      otpRefs[3].current?.focus();
      e.preventDefault();
    }
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordError(t("password.invalid"));
      return;
    }
    if (otp.some((digit) => digit === "")) {
      setOtpError(t("otp.invalid"));
      return;
    }
    const phone = localStorage.getItem("resetPhone");
    if (!phone) {
      setOtpError(t("otp.errorNoPhone"));
      return;
    }
    try {
      await resetPassword({
        phone: phone,
        otp: otp.join(""),
        newPassword: password,
      });
      toast.success(t("otp.success"));
      localStorage.removeItem("resetPhone");
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("otp.errorInvalidOTP"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-3xl max-w-sm">
        <CardHeader className="text-center">
          <img
            src="/images/icon.png"
            alt="Logo"
            className="mx-auto mb-1 h-14 w-14"
          />
          <CardTitle className="text-xl">{t("otp.title")}</CardTitle>
          <CardDescription>{t("otp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">{t("password.label")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("password.placeholder")}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  style={passwordError ? { borderColor: "#ef4444" } : {}}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("otp.label")}</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <Input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-9 flex justify-center text-center"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      style={otpError ? { borderColor: "#ef4444" } : {}}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {t("otp.submitButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
