"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      {/* Top Announcement Bar */}
      <div className="bg-pink-700 text-xs text-center py-2 font-medium">
        Free Shipping on Orders Over $150 | Use Code: <span className="font-bold">WIGLOVE20</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-serif font-bold tracking-wider hover:text-pink-400 transition">
              LuxeLocks
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/shop/all" className="text-gray-300 hover:text-white hover:underline decoration-pink-500 underline-offset-4 transition">
              Shop All
            </Link>
            <Link href="/shop/human-hair" className="text-gray-300 hover:text-white hover:underline decoration-pink-500 underline-offset-4 transition">
              Human Hair
            </Link>
            <Link href="/shop/synthetic" className="text-gray-300 hover:text-white hover:underline decoration-pink-500 underline-offset-4 transition">
              Synthetic
            </Link>
            <Link href="/shop/accessories" className="text-gray-300 hover:text-white hover:underline decoration-pink-500 underline-offset-4 transition">
              Accessories
            </Link>
          </div>

          {/* Right Side Icons (Search, Cart, Account) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Icon */}
            <button className="text-gray-300 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            {/* Account Icon */}
            <Link href="/account" className="text-gray-300 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>

            {/* Cart Icon with Badge */}
            <Link href="/cart" className="text-gray-300 hover:text-white transition relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/shop/all" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Shop All
            </Link>
            <Link href="/shop/human-hair" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Human Hair
            </Link>
            <Link href="/shop/synthetic" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Synthetic
            </Link>
            <Link href="/shop/accessories" className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Accessories
            </Link>
            <div className="border-t border-gray-700 my-2 pt-2">
              <Link href="/account" className="block px-3 py-2 text-gray-300 hover:text-white">
                My Account
              </Link>
              <Link href="/cart" className="block px-3 py-2 text-gray-300 hover:text-white">
                Cart (2)
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}