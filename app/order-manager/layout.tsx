import AuthGuard from "@/components/auth-guard";
import Navbar from "@/components/navbar";

export default function OrderManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthGuard allowedRoles={["MASTER_ADMIN", "ORDER_MANAGER"]}>
    <section className="min-h-screen">
      <Navbar />
      <main className="min-w-full font-sans flex flex-col items-center justify-center h-full p-3 md:p-8 pb-20 gap-16 sm:px-20">
        {children}
      </main>
    </section>
    // </AuthGuard>
  );
}
