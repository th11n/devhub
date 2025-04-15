import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function UnprotectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`antialiased w-full bg-[#0c0c0c] relative min-h-screen`}
    >
      <div className="py-4 px-4 sm:px-30 absolute left-0 right-0 z-[1000]">
        <Navbar />
      </div>
      {children}
      <Footer />
    </main>
  );
}
