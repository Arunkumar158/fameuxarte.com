import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";

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
              Discover and collect exceptional artwork from emerging and established artists worldwide.
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
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/artworks" className="hover:text-brand-red transition-colors">Artworks</Link>
              </li>
              <li>
                <Link to="/artists" className="hover:text-brand-red transition-colors">Artists</Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-brand-red transition-colors">Collections</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-red transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">About</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/blog/our-story" className="hover:text-brand-red transition-colors">Our Story</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-red transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/cancellations-and-refunds" className="hover:text-brand-red transition-colors">Cancellations & Refunds</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-red transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Stay Updated</h3>
            <p className="text-sm text-gray-300">
              Subscribe to receive updates on new arrivals and special promotions.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 placeholder:text-white/50"
              />
              <Button type="submit" size="icon" className="bg-brand-red hover:bg-brand-red/90 group">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Fameuxarte. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-brand-red transition-colors">Privacy Policy</Link>
              <span className="hidden md:inline">|</span>
              <Link to="/terms-of-service" className="hover:text-brand-red transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
