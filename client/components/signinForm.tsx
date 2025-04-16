"use client";

import { Input } from "./ui/input";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth";

const signInSchema = z.object({
  nickname: z.string().min(4, { message: "Invalid username" }),
  password: z.string().min(4, { message: "Invalid password" }),
});

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      nickname: "",
      password: "",
    },
  });

  const onSubmit = async (data: { nickname: string; password: string }) => {
    setError(null);
    
    try {
      await signIn(data.nickname, data.password);

      toast.success("Successfully signed in", {
        description: "Welcome back to your account!",
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-xl bg-neutral-900 shadow-lg shadow-neutral-800/30">
      <h1 className="text-2xl font-bold text-white mb-6">Sign In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="nickname" className="text-sm font-medium text-neutral-300">
            Username
          </label>
          <div className="relative">
            <Input
              id="nickname"
              placeholder="username"
              {...register("nickname")}
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-neutral-500"
            />
          </div>
          {errors.nickname && (
            <p className="text-sm text-red-400 mt-1">{errors.nickname.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-neutral-500"
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div
            className="flex items-center gap-2 text-red-500 text-sm"
            aria-live="polite"
          >
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2.5 mt-12 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 disabled:opacity-70 group"
        >
          <span>Sign In</span>
          <ArrowRight
            size={16}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </form>
    </div>
  );
}