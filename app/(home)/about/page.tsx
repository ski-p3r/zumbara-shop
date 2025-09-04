"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="rounded-3xl shadow-xl border-0 bg-white/90 dark:bg-zinc-900/90">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-2">{t("about.title")}</h1>
          <p className="mb-6 text-muted-foreground text-lg">
            {t("about.subtitle")}
          </p>
          <div className="space-y-4 text-base text-foreground">
            <p>{t("about.mission")}</p>
            <p>{t("about.values")}</p>
            <p>{t("about.team")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
