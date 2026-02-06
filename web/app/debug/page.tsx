"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function DebugPage() {
  const { user, isLoading, login, register } = useAuth();

  useEffect(() => {
    console.log("Debug - User:", user);
    console.log("Debug - isLoading:", isLoading);
  }, [user, isLoading]);

  const handleQuickLogin = async () => {
    try {
      await login("admin@event.com", "Admin123!");
    } catch (error) {
      console.error("Quick login failed:", error);
    }
  };

  const handleQuickRegister = async () => {
    try {
      await register("admin@event.com", "Admin123!", "Admin");
    } catch (error) {
      console.error("Quick register failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Current Status</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "Not logged in"}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <button
            onClick={handleQuickLogin}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Quick Login (admin@event.com)
          </button>
          <button
            onClick={handleQuickRegister}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
          >
            Quick Register Admin
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Navigation Test</h2>
        <div className="space-y-2">
          <a href="/admin/events" className="text-yellow-400 hover:text-yellow-300 underline block">
            Go to Admin Events
          </a>
          <a href="/login" className="text-yellow-400 hover:text-yellow-300 underline block">
            Go to Login
          </a>
          <a href="/register" className="text-yellow-400 hover:text-yellow-300 underline block">
            Go to Register
          </a>
        </div>
      </div>
    </div>
  );
}
