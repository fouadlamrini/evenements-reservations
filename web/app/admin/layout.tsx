"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is resolved and user is not admin
    if (!isLoading) {
      if (!user) {
        router.replace("/");
        return;
      }
      if (user.role !== "Admin") {
        // console.log("it not an admin ");
        router.replace("/events");
        return;
      }
    }
  }, [user, isLoading, router]);

  // Show loading while auth is being resolved
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show loading or redirect if user is not admin
  if (!user || user.role !== "Admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}
