import { verifyToken } from "@/lib/auth";
import "../globals.css";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = await verifyToken();

  if (!isAuthenticated) {
    redirect("/signin");
  }

  return (
    <main className={`w-full bg-[#0c0c0c] relative min-h-screen relative`}>
      <div className="py-4 px-4 sm:px-30 absolute left-0 right-0 z-[1000]">
        <Navbar />
      </div>
      {children}
    </main>
  );
}
