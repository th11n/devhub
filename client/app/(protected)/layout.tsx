import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={`w-full bg-[#0c0c0c] relative min-h-screen`}
    >
      {children}
    </main>
  );
}
