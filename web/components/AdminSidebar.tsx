"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || user.role !== "Admin") {
    return null;
  }

  const menuItems = [
    {
      href: "/admin/events",
      label: "Events",
      icon: "📅",
    },
    {
      href: "/admin/events/create",
      label: "Create Event",
      icon: "➕",
    },
    {
      href: "/admin/reservations",
      label: "Reservations",
      icon: "🎫",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: "👥",
    },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold mb-2">Admin Panel</h2>
        <p className="text-gray-400 text-sm">Manage your events</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-yellow-500 text-black"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-8 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Back to Site</span>
        </Link>
      </div>
    </div>
  );
}
