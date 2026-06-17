import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function MainLayout({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col flex-grow w-full relative">
      {/* Decorative ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#8B5CF6]/10 blur-[120px]" />
      </div>

      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-lg border-white/5 shadow-md py-3" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="container max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50 relative group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[#8B5CF6] shadow-lg group-hover:shadow-primary/20 transition-all">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              SkillSee
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-white z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden pt-24 pb-8 px-6 flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full pt-32 pb-20">
        <div className="container max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 mt-auto bg-card/30 relative z-10">
        <div className="container max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg text-white">SkillSee</span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium">Save. Learn. Master.</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
        <div className="container max-w-5xl mx-auto px-6 mt-8 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SkillSee. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
