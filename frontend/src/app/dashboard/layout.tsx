"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
        isActive 
          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Try to get the current user - this will fail if not authenticated
        await api.getCurrentUser();
        setIsLoading(false);
      } catch (error) {
        // Not authenticated, redirect to signin
        console.log("Not authenticated, redirecting to signin");
        router.push("/signin");
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Dashboard</h2>
            </div>
            <nav className="space-y-1">
              <NavItem href="/dashboard">
                Overview
              </NavItem>
              <NavItem href="/dashboard/profile">
                Profile
              </NavItem>
              <NavItem href="/dashboard/teams">
                My Teams
              </NavItem>
              <NavItem href="/dashboard/teams/create">
                Create Team
              </NavItem>
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => {
                    api.signOut();
                    router.push('/signin');
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 