"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/social-icons";
import { Calendar, CheckCircle, Clock, Globe, Users, Zap, LogIn, UserPlus } from "lucide-react";
import { LogoText } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  const words = ["Collaboration", "Communication", "Planning", "Management"];
  
  // Function to handle Sign In button click
  const handleSignInClick = () => {
    // Check if user is already authenticated
    if (api.auth.hasValidAccessToken()) {
      // User is logged in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not logged in, redirect to sign in page
      router.push("/signin");
    }
  };
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const currentWord = words[currentWordIndex];
    
    if (isTyping) {
      // Typing animation
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, 100); // Typing speed
      } else {
        // Finished typing, wait then start erasing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause before erasing
      }
    } else {
      // Erasing animation
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50); // Erasing speed (faster than typing)
      } else {
        // Finished erasing, move to next word
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedText, currentWordIndex, isTyping, words]);
  
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
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSignInClick}
              className="hidden md:block"
            >
              Sign In
            </Button>
            <Link href="/signup">
              <Button className="text-white">Sign Up</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section id="hero" className="py-20 hero-gradient flex items-center">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Team <span 
                className="text-primary"
                style={{ minWidth: '240px', display: 'inline-block' }}
              >
                {displayedText}
                <span className="animate-pulse text-primary">|</span>
              </span>
              <br />
              <span className="block mt-2">made simple</span>
            </h1>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link href="/signup">Start for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed to help teams collaborate more effectively,
              manage tasks efficiently, and track progress seamlessly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          
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
                  src="/dashboard.png"
                  alt="TeamSync workflow preview"
                  width={838}
                  height={1080}
                  className="max-w-md mx-auto h-auto rounded object-contain"
                />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          
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
                &quot;TeamSync has transformed how our product team collaborates. The intuitive interface and powerful features have increased our productivity by 35%.&quot;
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
                &quot;As a creative team, we needed something flexible yet structured. TeamSync gives us the perfect balance, especially for our remote team members.&quot;
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
                &quot;The analytics and reporting features in TeamSync have given us unprecedented insight into our team&apos;s workload and productivity patterns.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 md:px-6">          
          <div className="flex justify-center">
            
            {/* Pro Plan */}
            <div className="bg-card rounded-lg p-6 shadow-lg border-2 border-primary relative sm:w-1/2 lg:w-1/3 md:w-1/2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</div>
              <div className="mb-6 text-center">
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
                  <span>Time tracking &amp; reporting</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/signup?plan=professional">Get Started</Link>
              </Button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-center">
            <div className="justify-center">
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
          
          <div className="pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Rafael Guerra.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
