"use client";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Brain, Lock, Activity, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-terminal-black">
      <header className="w-full py-4 px-6 border-b border-terminal-border sticky top-0 z-50 bg-terminal-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Celorean Logo" className="h-8 w-8 text-terminal-green" style={{ filter: 'brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(2578%) hue-rotate(91deg) brightness(101%) contrast(101%)' }} />
            <span className="text-xl font-mono font-bold tracking-widest text-terminal-green">CELOREAN</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/about"
              className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-terminal-green transition-colors"
            >
              About
            </Link>
            <Link
              href="/docs"
              className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-terminal-green transition-colors"
            >
              Docs
            </Link>

            <Button asChild size="sm">
              <Link href={"/login"}>
                Start Learning
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b border-terminal-border">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-terminal-orange border border-terminal-orange px-3 py-1">
                // BLOCKCHAIN EDUCATION SYSTEM
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-mono font-bold mb-6 text-white uppercase tracking-tight">
              <span className="text-terminal-green">INCENTIVIZE</span> EDUCATION
              <br />
              WITH BLOCKCHAIN & AI
            </h1>
            <p className="text-base md:text-lg font-mono text-muted-foreground mb-8 leading-relaxed">
              Celorean leverages blockchain and AI to create a dynamic, secure, and rewarding learning experience. Transparent credentials. Verifiable achievements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href={"/login"}>
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">
                  Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Terminal Grid Background Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(var(--terminal-green)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--terminal-green)) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative border-b border-terminal-border">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex items-center gap-3">
            <Terminal className="h-6 w-6 text-terminal-green" />
            <h2 className="text-3xl font-mono font-bold uppercase tracking-tight text-white">
              KEY_FEATURES
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="terminal-box p-6 transition-colors hover:border-terminal-green group">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-terminal-green" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-terminal-green">[ACTIVE]</span>
              </div>
              <h3 className="text-lg font-mono font-bold uppercase mb-3 text-white group-hover:text-terminal-green transition-colors">SELF-VERIFICATION</h3>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                Prove your identity and credentials without revealing sensitive information using zero-knowledge proofs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="terminal-box p-6 transition-colors hover:border-terminal-green group">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-terminal-green" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-terminal-green">[ACTIVE]</span>
              </div>
              <h3 className="text-lg font-mono font-bold uppercase mb-3 text-white group-hover:text-terminal-green transition-colors">AI-POWERED LEARNING</h3>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                Personalized learning paths and content recommendations based on your progress and preferences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="terminal-box p-6 transition-colors hover:border-terminal-green group">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-terminal-green" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-terminal-green">[ACTIVE]</span>
              </div>
              <h3 className="text-lg font-mono font-bold uppercase mb-3 text-white group-hover:text-terminal-green transition-colors">BLOCKCHAIN SECURITY</h3>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                Your learning achievements and credentials are securely stored on the blockchain, ensuring authenticity and immutability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="terminal-box p-8 md:p-12 text-center hover:border-terminal-green transition-colors">
            <h2 className="text-2xl md:text-3xl font-mono font-bold uppercase mb-4 text-white">
              READY_TO_TRANSFORM_YOUR_LEARNING?
            </h2>
            <p className="font-mono text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join Celorean today and experience the future of education powered by blockchain and AI technology.
            </p>

            <Button size="lg" asChild>
              <Link href={"/login"}>
                Login / Signup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-terminal-border py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <img src="/logo.svg" alt="Celorean Logo" className="h-8 w-8" style={{ filter: 'brightness(0) saturate(100%) invert(84%) sepia(23%) saturate(2578%) hue-rotate(91deg) brightness(101%) contrast(101%)' }} />
                <span className="text-xl font-mono font-bold tracking-widest text-terminal-green">
                  CELOREAN
                </span>
              </Link>
              <p className="text-sm font-mono text-muted-foreground">
                Revolutionizing education through blockchain and AI technology.
              </p>
            </div>
            <div>
              <h3 className="font-mono font-bold uppercase mb-4 text-white text-sm tracking-wider">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Tutorials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono font-bold uppercase mb-4 text-white text-sm tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-mono font-bold uppercase mb-4 text-white text-sm tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm font-mono text-muted-foreground hover:text-terminal-green transition-colors uppercase tracking-wider"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-terminal-border mt-8 pt-8 text-center">
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              © {new Date().getFullYear()} CELOREAN. ALL_RIGHTS_RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
