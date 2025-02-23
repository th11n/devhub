import Link from "next/link";

export function Footer() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between w-full h-min py-2 px-4 items-center text-gray-500 text-sm text-center gap-4 bg-transparent absolute bottom-0">
      <h1>
        © 2025 by <Link className="text-gray-400" href="https://github.com/th11n">Dominik Krakowiak</Link>{" "}
        and <Link className="text-gray-400" href="https://github.com/style77">Joachim Hodana</Link>. All
        rights reserved.
      </h1>
      <div className="inline-flex items-center gap-3">
        <Link href="href">Terms and Conditions</Link>
        <Link href="href">Privacy Policy</Link>
      </div>
    </div>
  );
}