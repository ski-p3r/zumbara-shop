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
import { forgotPassword } from "@/utils/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgetPasswordPage() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Handle phone input changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+]/g, "");
    setPhone(value);
    if (value.length > 0) {
      if (!/^((\+2519\d{8})|(09\d{8}))$/.test(value)) {
        setPhoneError(t("register.phoneInvalid"));
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }
  };
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^((\+2519\d{8})|(09\d{8}))$/.test(phone)) {
      setPhoneError(t("register.phoneInvalid"));
      return;
    }
    try {
      await forgotPassword({ phone });
      toast.success(t("forgetPassword.successMessage"));
      localStorage.setItem("resetPhone", phone);
      router.push(`/auth/otp`);
    } catch (error) {
      toast.error(t("forgetPassword.errorFailedToSend"));
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
          <CardTitle className="text-xl">{t("forget.title")}</CardTitle>
          <CardDescription>{t("forget.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("register.phone")}</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder={t("register.phonePlaceholder")}
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  style={phoneError ? { borderColor: "#ef4444" } : {}}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("forget.submitButton")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
