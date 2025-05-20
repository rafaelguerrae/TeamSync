"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user was redirected from signup page
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccess("Account created successfully! Please sign in with your credentials.");
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    try { 
      setIsLoading(true);
    //  await api.auth.resetPassword(email);
      
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen px-8 flex flex-col">
      <div className="flex w-full justify-between items-center mb-6">
        <Link href="/" className="hover:opacity-80">
          <Image
            className="dark:invert"
                src="/teamsync.png"
                alt="teamsync logo"
            width={100}
            height={24}
            priority
          />
        </Link>
        <ModeToggle />
      </div>
      
      <main className="flex flex-col w-full max-w-md mx-auto my-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-600 text-sm rounded">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm font-medium leading-none">
                  Insert your email
                </p>

                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
                          
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting password..." : "Reset password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
