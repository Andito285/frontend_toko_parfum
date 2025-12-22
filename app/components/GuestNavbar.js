"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GuestNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const navItems = [
        { name: "Beranda", href: "/" },
        { name: "Parfum", href: "/perfumes" },
        { name: "Brand", href: "/brands" },
        { name: "Tentang", href: "/about" },
    ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-2xl font-bold text-indigo-700 hover:text-indigo-500 transition-colors"
                    >
                        Jamal<span className="text-purple-600">Parfum</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => router.push("/login")}
                            className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                        >
                            Masuk
                        </button>
                        <button
                            onClick={() => router.push("/register")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Daftar
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-gray-700 focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col space-y-3 pt-2 border-t border-gray-200 px-4">
                                <button
                                    onClick={() => {
                                        router.push("/login");
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
                                >
                                    Masuk
                                </button>
                                <button
                                    onClick={() => {
                                        router.push("/register");
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Daftar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
