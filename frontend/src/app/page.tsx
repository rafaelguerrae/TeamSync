"use client";

import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/social-icons";
import { Calendar, CheckCircle, Clock, Globe, Users, Zap } from "lucide-react";
import { LogoText } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="#hero" className="hover:opacity-80">
              <LogoText size="medium" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="text-white">Sign Up</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section id="hero" className="py-20 md:py-28 hero-gradient">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Seamless Team <span className="text-primary">Collaboration</span> Made Simple
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              TeamSync brings your team together with intuitive task management, 
              real-time communication, and productivity analytics all in one platform.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="default" asChild>
                <Link href="/signup">Start for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-xl border bg-card">
              <Image
                src="/teamsync.png"
                alt="TeamSync dashboard preview"
                width={600}
                height={400}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Teams Choose TeamSync</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed to help teams collaborate more effectively,
              manage tasks efficiently, and track progress seamlessly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and track tasks with ease. Set deadlines, priorities, 
                and custom statuses to keep everyone on the same page.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Collaborate in real-time with comments, file sharing, and @mentions.
                Keep all conversations organized by project or task.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resource Planning</h3>
              <p className="text-muted-foreground">
                Visualize team workloads, allocate resources efficiently, and
                ensure no one is overbooked or underutilized.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Time Tracking</h3>
              <p className="text-muted-foreground">
                Track time spent on tasks and projects. Generate reports to
                analyze productivity and improve resource allocation.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation</h3>
              <p className="text-muted-foreground">
                Automate routine tasks, notifications, and workflows to save
                time and reduce manual work for your team.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Remote-Friendly</h3>
              <p className="text-muted-foreground">
                Perfect for distributed teams with features designed to bridge
                the gap between remote and in-office team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-16 text-center">How TeamSync Works</h2>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Your Workspace</h3>
                    <p className="text-muted-foreground">Set up your team workspace and invite team members with customizable roles and permissions.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Organize Projects & Tasks</h3>
                    <p className="text-muted-foreground">Create projects, break them down into manageable tasks, and assign them to team members.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                    <p className="text-muted-foreground">Monitor task status, track time, and visualize progress with intuitive dashboards and reports.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-semibold">4</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Collaborate & Communicate</h3>
                    <p className="text-muted-foreground">Comment on tasks, share files, and communicate in real-time to keep everyone aligned.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-first md:order-last border rounded-lg p-4 bg-card">
              <Image
                src="/teamsync.png"
                alt="TeamSync workflow preview"
                width={500}
                height={350}
                className="w-full h-auto rounded object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-16 text-center">What Teams Say About Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="text-primary font-semibold">AB</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alex Brown</h4>
                  <p className="text-sm text-muted-foreground">Product Manager, TechCorp</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "TeamSync has transformed how our product team collaborates. The intuitive interface and powerful features have increased our productivity by 35%."
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="text-primary font-semibold">GB</span>
                </div>
                <div>
                  <h4 className="font-semibold">Gabriel Ben</h4>
                  <p className="text-sm text-muted-foreground">Robotics Intern</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As a creative team, we needed something flexible yet structured. TeamSync gives us the perfect balance, especially for our remote team members."
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="text-primary font-semibold">MR</span>
                </div>
                <div>
                  <h4 className="font-semibold">Michael Rodriguez</h4>
                  <p className="text-sm text-muted-foreground">Director of Operations, GrowCo</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "The analytics and reporting features in TeamSync have given us unprecedented insight into our team's workload and productivity patterns."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your team's needs. All plans include core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1  max-w-5xl mx-auto">
            
            
            {/* Pro Plan */}
            <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-sm text-muted-foreground mb-4">Advanced features for growing teams</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">Free</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Advanced task management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>20 GB storage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Time tracking & reporting</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/signup?plan=professional">Get Started</Link>
              </Button>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Try TeamSync for Free</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Join thousands of teams already using TeamSync to boost productivity and 
            streamline collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="#hero" className="hover:opacity-80 inline-block mb-4">
                <LogoText size="medium" />
              </Link>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/rafaelguerrae" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/rafaelguerra/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Rafael Guerra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
