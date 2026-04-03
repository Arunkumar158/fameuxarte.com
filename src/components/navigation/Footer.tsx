import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 127.14 96.36" 
    className={className} 
    fill="currentColor"
  >
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.18,46,96.06,53,91,65.69,84.69,65.69Z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-brand-black/80 backdrop-blur-md border-t border-white/10">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
              <img 
                src="/lovable-uploads/2918892f-9b80-4b21-a9fe-1f2d9b05f208.png" 
                alt="Fameuxarte Logo" 
                className="w-8 h-8"
              />
              FAMEUXARTE
            </Link>
            <p className="text-sm text-gray-300">
              Discover and acquire exceptional, investment-grade artwork from emerging and established artists worldwide.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/fameuxarte" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://www.facebook.com/fameuxarte" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <Facebook className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://twitter.com/fameuxarte" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <Twitter className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://www.youtube.com/@fameuxarte" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <Youtube className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://www.linkedin.com/company/fameuxarte" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://discord.gg/76nSqrAc" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                  <DiscordIcon className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/artworks" className="hover:text-brand-gold transition-colors">Artworks</Link>
              </li>
              <li>
                <Link to="/artists" className="hover:text-brand-gold transition-colors">Artists</Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-brand-gold transition-colors">Collections</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-gold transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">About</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/blog/our-story" className="hover:text-brand-gold transition-colors">Our Story</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-gold transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/cancellations-and-refunds" className="hover:text-brand-gold transition-colors">Cancellations & Refunds</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-gold transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Stay Updated</h3>
            <p className="text-sm text-gray-300">
              Subscribe for collection updates and exclusive access to new acquisitions.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 placeholder:text-white/50"
              />
              <Button type="submit" size="icon" className="bg-brand-gold hover:bg-brand-gold/90 group">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Fameuxarte. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
              <span className="hidden md:inline">|</span>
              <Link to="/terms-of-service" className="hover:text-brand-gold transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
