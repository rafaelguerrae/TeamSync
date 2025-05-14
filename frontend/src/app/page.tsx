"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/social-icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link  href="#hero" className="hover:opacity-80">
              <Image
                src="/nesxt.svg"
                alt="Nesxt.js logo"
                width={80}
                height={24}
                className="dark:invert"
                priority
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section id="hero" className="py-16 md:py-24 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            NestJS + NextJS CRUD Application
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-muted-foreground">
            A modern, type-safe, and scalable solution for building full-stack applications
            with seamless data management.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="default" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Application Structure</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Frontend Card */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Frontend (NextJS)</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Modern React with TypeScript</li>
                <li>• App Router for improved routing</li>
                <li>• Shadcn UI components</li>
                <li>• Dark/Light mode support</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            
            {/* Backend Card */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">Backend (NestJS)</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• TypeScript-based REST API</li>
                <li>• Modular architecture</li>
                <li>• Built-in validation</li>
                <li>• Authentication & authorization</li>
                <li>• Database ORM integration</li>
              </ul>
            </div>
            
            {/* CRUD Operations Card */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold mb-3">CRUD Operations</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Create new records</li>
                <li>• Read existing data</li>
                <li>• Update information</li>
                <li>• Delete records</li>
                <li>• Data validation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-medium">User Authentication</h3>
                    <p className="text-muted-foreground">Secure signup and signin with JWT authentication</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-medium">Data Management</h3>
                    <p className="text-muted-foreground">Create, view, update and delete your records</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-medium">API Integration</h3>
                    <p className="text-muted-foreground">NextJS frontend communicates with NestJS backend API</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-medium">Responsive UI</h3>
                    <p className="text-muted-foreground">Beautiful interface that works on all devices</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-first md:order-last border rounded-lg p-4 bg-card">
              <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Application Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Sign up now and start managing your data with our powerful CRUD application.
          </p>
          <Button size="lg" variant="default" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
            <Link  href="#hero" className="hover:opacity-80">
              <Image
                src="/nesxt.svg"
                alt="Nesxt.js logo"
                width={80}
                height={20}
                className="dark:invert"
                priority
              />
            </Link>
              <span className="ml-2 text-sm text-muted-foreground">© 2025 Rafael Guerra</span>
            </div>
            <div className="flex gap-6 items-center">
              <a 
                href="https://github.com/rafaelguerrae" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/in/rafaelguerra/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
