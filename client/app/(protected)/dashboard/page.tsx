import { LoginForm } from "@/components/loginForm";

export default function Dashboard() {
  const isAuthenticated = true;
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  return (
    <div className="bg-[#0c0c0c] w-full px-12 py-6 overflow-y-auto pt-40 relative min-h-screen">

    </div>
  );
}
