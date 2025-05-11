"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log({ email, password });
  };

  return (
    <div className="hero-gradient min-h-screen px-8 flex flex-col">
      <div className="flex w-full justify-between items-center mb-6">
        <Link href="/">
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
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-8">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-bold">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
