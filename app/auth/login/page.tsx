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
import { useState } from "react";
import { useLanguage } from "@/providers/language-provider";
import Link from "next/link";
import { loginUser } from "@/utils/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { t } = useLanguage();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      if (response.data.accessToken) {
        toast.success(t("login.success"));
        router.push("/");
      } else {
        toast.error(response.data.details?.message || t("login.errorFailed"));
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.details?.message || t("login.errorGeneric")
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-3xl max-w-sm">
        <CardHeader className="text-center">
          <img
            src="/images/icon.png"
            alt="Logo"
            className="mx-auto h-14 w-14 mb-1"
          />
          <CardTitle className="text-xl">{t("login.welcomeBack")}</CardTitle>
          <CardDescription>{t("login.signInToAccount")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("login.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("login.passwordLabel")}</Label>
                  <Link
                    href="/forget-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("login.loginButton")}
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              {t("login.dontHaveAccount")}
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                {t("login.registerLink")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
