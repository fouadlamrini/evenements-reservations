"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <nav className="bg-black/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/assets/logo.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-white font-bold text-xl">EventReserve</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/events"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
             
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-yellow-400 hover:text-yellow-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md text-sm font-bold transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}