import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} antialiased w-full bg-[#0c0c0c] relative min-h-screen`}>
        <div className="py-4 px-4 sm:px-30 fixed left-0 right-0 z-[1000]">
          <Navbar />
        </div>
        {children}
        <Footer />
        <div className="bg-emerald-600 h-48 w-48 blur-fix absolute top-[50%]" />
        <div className="bg-emerald-300 h-48 w-48 blur-fix absolute top-[80%] right-0" />
        <div className="bg-emerald-200 h-48 w-48 blur-fix absolute top-[10%] left-[50%] translate-x-[-50%]" />
      </body>
    </html>
  );
}
