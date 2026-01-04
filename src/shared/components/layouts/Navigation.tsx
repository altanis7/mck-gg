"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/features/admin/hooks/useAdminAuth";
import { useAdminLogout } from "@/features/admin/hooks/useAdminLogout";
import { Button } from "@/shared/components/ui/Button";

const publicNavItems = [
  { href: "/", label: "홈" },
  { href: "/matches", label: "경기 기록" },
  { href: "/ratings", label: "랭킹" },
  { href: "/rankings/positions", label: "라인별 랭킹" },
  { href: "/champions", label: "챔피언" },
  { href: "/stats", label: "통계" },
];

const adminNavItems = [
  { href: "/admin/members", label: "멤버 관리" },
  { href: "/admin/matches", label: "경기 관리" },
];

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAdminAuth();
  const logoutMutation = useAdminLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = isAuthenticated
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-partial-sans">
            <span className="text-white">MCK</span>
            <span className="text-blue-400">.GG</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-1 pt-1 pb-3 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-slate-700"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth + Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
              >
                로그아웃
              </Button>
            ) : (
              <Link href="/admin/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                >
                  관리자 로그인
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive
                      ? "bg-slate-800 text-blue-400"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Auth Button in Mobile Menu */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                  >
                    관리자 로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
