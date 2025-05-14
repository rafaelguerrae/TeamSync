"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { authApi } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Default avatar URL using UI Avatars
  const getDefaultAvatarUrl = (name: string) => {
    const formattedName = encodeURIComponent(name || "User");
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0D8ABC&color=fff`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !alias || !email || !password) {
      setError("All fields are required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Generate an avatar URL based on the user's name
      const image = getDefaultAvatarUrl(name);
      
      // Sign up the user using the fetch API directly since authApi doesn't have signUp
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          alias,
          email,
          password,
          image
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed: ${response.status}`);
      }
      
      // On successful signup, redirect to signin page
      router.push("/signin?registered=true");
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="hero-gradient min-h-screen px-8 sm:px-8 flex flex-col">
      <div className="flex w-full justify-between items-center mb-6">
        <Link href="/" className="hover:opacity-80">
          <Image
            className="dark:invert"
            src="/nesxt.svg"
            alt="Nesxt.js logo"
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
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="alias" className="text-sm font-medium leading-none">
                  Username
                </label>
                <div className="flex">
                  <div className="inline-flex items-center px-3 border border-r-0 rounded-l-md border-input bg-muted text-muted-foreground">
                    @
                  </div>
                  <Input
                    id="alias"
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    disabled={isLoading}
                    required
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline font-bold">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
