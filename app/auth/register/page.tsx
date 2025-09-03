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
import i18n from "@/lib/i18n";
import { useLanguage } from "@/providers/language-provider";
import { registerUser } from "@/utils/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Handle phone input changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9+]/g, ""); // Allow only digits and +
    setForm({ ...form, phone: value });

    // Validate phone number (only for feedback, not to block input)
    if (value.length > 0) {
      if (!/^(\+2519\d{8}|09\d{8})$/.test(value)) {
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
    if (!/^(\+2519\d{8}|09\d{8})$/.test(form.phone)) {
      setPhoneError(t("register.phoneInvalid"));
      return;
    }
    try {
      const response = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        language: i18n.language, // Use i18n.language instead of state
      });
      if (response.data.accessToken) {
        toast.success(t("register.success"));
        router.push("/");
      } else {
        toast.error(
          response.data.details?.message || t("register.errorFailed")
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.details?.message || t("register.errorGeneric")
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/images/icon.png"
            alt="Logo"
            className="mx-auto mb-1 h-14 w-14"
          />
          <CardTitle className="text-xl">{t("register.title")}</CardTitle>
          <CardDescription>{t("register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2 md:gap-6">
                <div className="flex flex-col gap-1">
                  <Label className="mb-1" htmlFor="firstName">
                    {t("register.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t("register.firstNamePlaceholder")}
                    required
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="mb-1" htmlFor="lastName">
                    {t("register.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t("register.lastNamePlaceholder")}
                    required
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("register.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("register.emailPlaceholder")}
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("register.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label
                  className="text-gray-700 dark:text-gray-300"
                  htmlFor="phone"
                >
                  {t("register.phone")}
                </Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder={t("register.phonePlaceholder")}
                  required
                  value={form.phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  style={phoneError ? { borderColor: "#ef4444" } : {}}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">{t("register.address")}</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder={t("register.addressPlaceholder")}
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {t("register.registerButton")}
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              {t("register.alreadyHaveAccount")}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t("register.loginLink")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
