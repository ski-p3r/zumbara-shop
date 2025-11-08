import type { ReactNode } from "react";
import "@/app/globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-sans">
      <Navbar />

      {/* Scrollable main content only */}
      <main className="flex-1 overflow-y-auto px-6 py-10 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
}
