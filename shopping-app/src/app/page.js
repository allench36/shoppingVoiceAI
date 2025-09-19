"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/shop"); // navigate to main shop page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl md:text-6xl font-bold mb-12 text-center">
        Welcome to Voice Shop
      </h1>

      <button
        onClick={handleStart}
        className = "px-12 py-8 text-3xl md:text-4xl font-bold rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        // className="px-12 py-8 text-3xl md:text-4xl font-bold rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        Click to Start Voice
      </button>

      <p className="mt-8 text-lg text-gray-600 text-center max-w-md">
        Activate voice recognition to start adding items to your cart hands-free.
      </p>
    </div>
  );
}
