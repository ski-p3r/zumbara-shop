"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", email: "", message: "" });
        toast.success(t("contact.success"));
      } else {
        toast.error(t("contact.error"));
      }
    } catch {
      toast.error(t("contact.error"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-primary/10 to-background/80 dark:from-primary/20 dark:to-zinc-900/90">
        <CardContent className="p-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <Mail className="h-12 w-12 text-primary mb-2" />
            <h1 className="text-4xl font-extrabold mb-2 text-primary">
              {t("contact.title")}
            </h1>
            <p className="mb-4 text-muted-foreground text-center text-lg">
              {t("contact.subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div>
              <Label htmlFor="name">{t("contact.name")}</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-card mt-1"
                placeholder={t("contact.namePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="email">{t("contact.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-card mt-1"
                placeholder={t("contact.emailPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="message">{t("contact.message")}</Label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                className="bg-card mt-1 rounded-lg border p-2 min-h-[120px] w-full"
                placeholder={t("contact.messagePlaceholder")}
              />
            </div>
            <Button
              type="submit"
              className="w-full font-bold "
              disabled={isSending}
            >
              {isSending ? t("contact.sending") : t("contact.send")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
