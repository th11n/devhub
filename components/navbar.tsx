"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(3).max(30),
  description: z.string().min(5).max(150),
  category: z.string().min(5).max(40),
  url: z.string().url().min(3).max(100),
});

export function Navbar() {
  return (
    <div className="mx-auto w-full flex justify-between items-center z-[1] bg-white/5 backdrop-blur-2xl rounded-xl shadow-xl">
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Devhub Logo"
          height={60}
          width={60}
          className="h-[60px] w-[60px] sm:h-[90px] sm:w-[90px] object-contain"
        />
      </Link>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="cursor-pointer bg-transparent block">
            <PackagePlus className="size-6 mr-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0c0c0c] border-0 text-white overflow-hidden">
          <DialogHeader>
            <DialogTitle>Submit new resource</DialogTitle>
            <DialogDescription className="relative overflow-hidden z-[1]">
              <Modal />
            </DialogDescription>
          </DialogHeader>
          <div className="bg-emerald-600 h-48 w-48 blur-[200px] absolute top-[50%]" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Modal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/75">Name of website</FormLabel>
              <FormControl>
                <Input className="border-white/25 border-2 focus-visible:ring-0 focus:!border-white/50 text-white" placeholder="Devhub" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/75">Website description</FormLabel>
              <FormControl>
                <Input className="border-white/25 border-2 focus-visible:ring-0 focus:!border-white/50 text-white" placeholder="Website with all types of tools and assets for developers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/75">Website URL</FormLabel>
              <FormControl>
                <Input className="border-white/25 border-2 focus-visible:ring-0 focus:!border-white/50 text-white" placeholder="https://devhub.xyz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/75">Category of website</FormLabel>
              <FormControl>
                <Input className="border-white/25 border-2 focus-visible:ring-0 focus:!border-white/50 text-white" placeholder="Tools" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="cursor-pointer bg-black/25" type="submit">Submit</Button>
      </form>
    </Form>
  );
}
