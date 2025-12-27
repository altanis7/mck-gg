"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/features/admin/hooks/useAdminAuth";
import { logout } from "@/features/admin/api/adminAuthApi";
import { Button } from "@/shared/components/ui/Button";

const publicNavItems = [
  { href: "/", label: "홈" },
  { href: "/matches", label: "경기 기록" },
  { href: "/stats", label: "통계" },
];

const adminNavItems = [
  { href: "/admin/members", label: "멤버 관리" },
  { href: "/admin/matches/new", label: "경기 등록" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, refetch } = useAdminAuth();

  const navItems = isAuthenticated
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  async function handleLogout() {
    await logout();
    refetch();
    window.location.href = '/';
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button size="sm" variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <Link href="/admin/login">
                <Button size="sm" variant="outline">
                  관리자 로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
