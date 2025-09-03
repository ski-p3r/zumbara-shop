import Navbar from "@/components/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen">
      <Navbar />
      <main className="min-w-full font-sans flex flex-col items-center justify-center h-full p-8 pb-20 gap-16 sm:p-20">
        {children}
      </main>
    </section>
  );
}
