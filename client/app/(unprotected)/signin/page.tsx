import { SignInForm } from "@/components/signinForm";
import { Spinner } from "@/components/spinner";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function SignIn() {
  const isAuthenticated = await verifyToken()

  if (isAuthenticated) {
    redirect('/dashboard')
  }
  return (
    <div className="bg-[#0c0c0c] w-full px-12 py-6 overflow-y-auto relative min-h-[92.5vh] flex flex-col items-center justify-center">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full min-h-[69vh]">
            <Spinner />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}