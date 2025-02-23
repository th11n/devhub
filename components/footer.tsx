"use client";

import { useRef } from "react";
import Link from "next/link";
import SplitType from "split-type";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!footerRef.current) return;

    const typeSplit = new SplitType(footerRef.current, {
      types: "chars",
      tagName: "span",
    });

    gsap.set(typeSplit.chars, { y: "110%", opacity: 0 });

    gsap.to(typeSplit.chars, {
      y: "0%",
      opacity: 1,
      rotationZ: "0",
      duration: 0.4,
      ease: "sine.out",
      stagger: 0.03,
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 85%",
      },
    });

    return () => typeSplit.revert();
  }, { scope: footerRef });

  return (
    <div
      ref={footerRef}
      className="flex flex-col sm:flex-row sm:justify-between w-full h-min py-2 px-4 items-center text-gray-500 text-sm text-center gap-4 bg-transparent absolute bottom-0"
    >
      <h1>
        © 2025 by{" "}
        <Link className="text-gray-400 inline-block" href="https://github.com/th11n">
          Dominik Krakowiak
        </Link>{" "}
        and{" "}
        <Link className="text-gray-400 inline-block" href="https://github.com/style77">
          Joachim Hodana
        </Link>
        . All rights reserved.
      </h1>
      <div className="inline-flex items-center gap-3">
        <Link className="inline-block pr-4" href="href">
          Terms and Conditions
        </Link>
        <Link className="inline-block" href="href">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
