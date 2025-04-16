import { verifyToken } from "@/lib/auth";
import "../globals.css";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = await verifyToken()

  if (!isAuthenticated) {
    redirect('/signin')
  }


  return (
    <main
      className={`w-full bg-[#0c0c0c] relative min-h-screen`}
    >
      {children}
    </main>
  );
}
