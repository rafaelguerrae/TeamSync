"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { LogoText } from "@/components/ui/logo";
import { Home, UserCircle, Users, PlusCircle, LogOut, Menu } from "lucide-react";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isMinimized: boolean;
  icon?: React.ReactNode;
}

function NavItem({ href, children, isMinimized, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center py-2 text-sm font-medium rounded-md transition-colors hover:cursor-pointer",
        isMinimized ? "justify-center px-2" : "px-4",
        isActive 
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white " 
          : "text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary"
      )}
    >
      {icon && (
        <span className={isMinimized ? "text-lg" : "mr-3 text-lg"}>
          {icon}
        </span>
      )}
      {!isMinimized && <span>{children}</span>}
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detect screen size and set mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      
      // Auto-minify sidebar on mobile
      if (mobile && !isMinimized) {
        setIsMinimized(true);
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isMinimized]);

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    if (isMobileView) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsMinimized(!isMinimized);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    async function checkAuth() {
      if (!mounted) return;
      
      try {
        console.log("Dashboard: Checking authentication...");
         
        // Check if we already have a valid access token first
        if (api.auth.hasValidAccessToken()) {
          console.log("Using existing valid access token");
          try {
            const user = await api.users.getCurrent();
            console.log("User authenticated successfully:", user);
            if (mounted) setIsLoading(false);
            return;
          } catch (userError) {
            console.error("Failed to get current user with existing token:", userError);
            // Retry a couple times before falling back to token refresh
            if (retryCount < maxRetries) {
              console.log(`Retrying user fetch (${retryCount + 1}/${maxRetries})...`);
              retryCount++;
              // Small delay before retry
              await new Promise(resolve => setTimeout(resolve, 500));
              await checkAuth();
              return;
            }
            // Continue to token refresh if retries exhausted
          }
        }
        
        // First try to refresh the token if needed
        const refreshResult = await api.auth.refreshToken();
        console.log("Token refresh result:", refreshResult);
        
        if (!refreshResult) {
          console.log("Token refresh failed, redirecting to signin");
          if (mounted) router.push("/signin");
          return;
        }
        
        // Then try to get the current user
        try {
          const user = await api.users.getCurrent();
          console.log("User authenticated successfully:", user);
          if (mounted) setIsLoading(false);
        } catch (userError) {
          console.error("Failed to get current user:", userError);
          if (mounted) router.push("/signin");
        }
      } catch (error) {
        // Not authenticated, redirect to signin
        console.error("Authentication error:", error);
        if (mounted) router.push("/signin");
      }
    }

    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 shadow transition-all duration-300 z-20",
        isMinimized ? "w-16" : "w-64",
        isMobileView && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex flex-col p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {!isMinimized && 
            <Link href="/" className="hover:opacity-80">
              <LogoText size="small"/>
            </Link>
            }
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 hover:cursor-pointer"
              aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <nav className={cn("p-4 space-y-1", isMinimized && "flex flex-col items-center")}>
          <NavItem 
            href="/dashboard" 
            isMinimized={isMinimized}
            icon={<Home className="h-5 w-5" />}
          >
            Overview
          </NavItem>
          <NavItem 
            href="/dashboard/profile" 
            isMinimized={isMinimized}
            icon={<UserCircle className="h-5 w-5" />}
          >
            Profile
          </NavItem>
          <NavItem 
            href="/dashboard/teams" 
            isMinimized={isMinimized}
            icon={<Users className="h-5 w-5" />}
          >
            My Teams
          </NavItem>
          <NavItem 
            href="/dashboard/teams/create" 
            isMinimized={isMinimized}
            icon={<PlusCircle className="h-5 w-5" />}
          >
            Create Team
          </NavItem>
          
          <div className={cn(
            "pt-4 mt-4 border-t border-gray-200 dark:border-gray-800",
            isMinimized && "w-full flex justify-center"
          )}>
            <button 
              onClick={async () => {
                await api.auth.signOut();
                router.push('/');
              }}
              className={cn(
                "flex items-center text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md hover:cursor-pointer",
                isMinimized ? "p-2 justify-center" : "w-full px-4 py-2"
              )}
              aria-label="Sign Out"
            >
              <LogOut className={cn("h-5 w-5", !isMinimized && "mr-3")} />
              {!isMinimized && <span>Sign Out</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 min-h-screen flex-1",
        !isMobileView && (isMinimized ? "ml-16" : "ml-64")
      )}>
        {/* Mobile Top Bar with Menu Button */}
        {isMobileView && (
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 shadow p-4 flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 mr-4"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <LogoText size="small" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
} 