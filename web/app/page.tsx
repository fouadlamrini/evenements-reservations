"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're not already on the correct page and auth is resolved
    if (!isLoading && pathname === "/") {
      if (user?.role === "Admin") {
        router.replace("/admin/events");
      } else if (user) {
        router.replace("/events");
      }
      // If no user, stay on home page (they can login from here)
    }
  }, [user, isLoading, pathname, router]);

  // Show loading while auth is being resolved
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show home page for non-authenticated users
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Event Reservation System</h1>
          <p className="text-gray-400 mb-8">Please login to continue</p>
          <div className="space-x-4">
            <a
              href="/login"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded inline-block transition-colors"
            >
              Login
            </a>
            <a
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded inline-block transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting message for authenticated users
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}
