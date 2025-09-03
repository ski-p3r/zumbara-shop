import AdminNavbar from "@/components/adminNavbar";
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="min-h-screen">
        <AdminNavbar />
        <main className="min-w-full font-sans flex flex-col items-center justify-center h-full p-8 pb-20 gap-16 sm:px-20">
          {children}
        </main>
      </section>
      <footer className="dark:bg-background py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zumbara. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
