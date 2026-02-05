"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import Image from "next/image";
import FormInput from "@/components/FormInput";
import Link from "next/link";
import Header from "@/components/Header";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.register(form);
      alert("Account created successfully!");
      setForm({ name: "", email: "", password: "" });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]" style={{ backgroundImage: "url('/assets/background.jpg')" }}>
        <div className="bg-black/50 p-8 rounded-xl shadow-lg w-full max-w-md backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/logo.jpg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Register
          </h2>
          <form onSubmit={handleSubmit}>
            <FormInput
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <FormInput
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormInput
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>
          <p className="text-sm text-white text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
