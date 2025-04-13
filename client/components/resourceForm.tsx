"use client";

import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/utils";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { createResource } from "@/lib/actions/create-resource";
import { Controller } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Turnstile } from "next-turnstile";

const createSchema = (categories: string[]) =>
  z.object({
    url: z.string().url({ message: "Invalid URL" }),
    category: z.string().refine((val) => categories.includes(val), {
      message: "Invalid category",
    }),
  });

export function ResourceForm() {
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required");
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const { data } = useSWR(`/api/categories`, fetcher);

  useEffect(() => {
    if (data) {
      setCategories(data.data);
    }
  }, [data]);

  const schema = createSchema(categories);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "",
      category: "",
    },
  });

  const onSubmit = async (data: { url: string; category: string }) => {
    setError(null);
    const formData = new FormData();
    formData.append("url", data.url);
    formData.append("category", data.category);

    if (turnstileStatus !== "success") {
      setError("Please verify you are not a robot");
      return;
    }

    const token = (
      document.querySelector(
        'input[name="cf-turnstile-response"]'
      ) as HTMLInputElement
    )?.value;

    if (!token) {
      setError("Missing or invalid verification token");
      return;
    }

    formData.append("token", token);

    toast.success("Resource sent", {
      description: "Your resource is currently under verification. Thank you!",
    });

    await createResource(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-xl bg-neutral-900 shadow-lg shadow-neutral-800/30">
      <h1 className="text-2xl font-bold text-white mb-6">Submit Resource</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium text-neutral-300">
            Resource URL
          </label>
          <div className="relative">
            <Input
              id="url"
              placeholder="https://..."
              {...register("url")}
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-neutral-500"
            />
          </div>
          {errors.url && (
            <p className="text-sm text-red-400 mt-1">{errors.url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-neutral-300"
          >
            Category
          </label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <SelectTrigger
                  id="category"
                  className="w-full bg-neutral-800 border-neutral-700 text-white focus:ring-emerald-400 focus:border-emerald-400"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="focus:bg-neutral-700 hover:bg-neutral-700 focus:text-emerald-400"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-400 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          retry="auto"
          refreshExpired="auto"
          sandbox={process.env.NODE_ENV === "development"}
          onError={() => {
            setTurnstileStatus("error");
            setError("Security check failed. Please try again.");
          }}
          onExpire={() => {
            setTurnstileStatus("expired");
            setError("Security check expired. Please verify again.");
          }}
          onLoad={() => {
            setTurnstileStatus("required");
            setError(null);
          }}
          onVerify={() => {
            setTurnstileStatus("success");
            setError(null);
          }}
        />
        {error && (
          <div
            className="flex items-center gap-2 text-red-500 text-sm mb-2"
            aria-live="polite"
          >
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 disabled:opacity-70 group"
        >
          <span>Submit Resource</span>
          <ArrowRight
            size={16}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </form>
    </div>
  );
}
