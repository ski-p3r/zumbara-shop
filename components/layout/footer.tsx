export default function Footer() {
  return (
    <footer className="shrink-0 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 text-center text-sm py-6 text-muted-foreground">
      © {new Date().getFullYear()} Zumbara Shop. All rights reserved.
    </footer>
  );
}
