import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col w-screen">
      <Navbar />
      <main className="flex-1 w-screen">{children}</main>
      <Footer />
    </div>
  );
}
