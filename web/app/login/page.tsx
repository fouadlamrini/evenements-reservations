"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FormInput from "@/components/FormInput";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await AuthService.login(form);
      localStorage.setItem("token", response.data.token);
      alert("Login successful!");
      router.push("/");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/background.jpg')" }}
    >
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
          Welcome
        </h2>
        <form onSubmit={handleSubmit}>
          <FormInput
            name="email"
            type="text"
            placeholder="Username"
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
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-white text-center mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-yellow-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
