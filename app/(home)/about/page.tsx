"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className=" rounded-3xl shadow-2xl border-0 min-h-screen bg-gradient-to-br from-primary/10 to-background/80 dark:from-primary/20 dark:to-zinc-900/90   flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="rounded-3xl shadow-2xl border-0 bg-white/90 dark:bg-black/90 overflow-hidden relative">
          {/* Decorative semi-transparent border */}
          <div className="absolute inset-0 border-4 border-transparent rounded-3xl bg-gray-500/20" />
          <CardContent className="p-10 relative z-10">
            <h1 className="text-4xl font-extrabold mb-4 text-black dark:text-white">
              {t("about.title")}
            </h1>
            <p className="mb-8 text-lg text-gray-600/80 dark:text-gray-400/80 italic">
              {t("about.subtitle")}
            </p>
            <div className="space-y-6 text-base text-black dark:text-white">
              <div className="p-4 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-opacity duration-300">
                <h2 className="text-xl font-semibold text-black/90 dark:text-white/90">Our Mission</h2>
                <p className="text-black/80 dark:text-white/80">{t("about.mission")}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-opacity duration-300">
                <h2 className="text-xl font-semibold text-black/90 dark:text-white/90">Our Values</h2>
                <p className="text-black/80 dark:text-white/80">{t("about.values")}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-opacity duration-300">
                <h2 className="text-xl font-semibold text-black/90 dark:text-white/90">Our Team</h2>
                <p className="text-black/80 dark:text-white/80">{t("about.team")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}