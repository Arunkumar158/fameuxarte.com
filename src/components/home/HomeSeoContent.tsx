import React from "react";
import { Link } from "react-router-dom";

const HomeSeoContent = () => {
  return (
    <section 
      className="w-full bg-black px-4 sm:px-8 py-16 sm:py-24 border-t border-white/[0.08]" 
      aria-labelledby="seo-content-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-3xl">
          {/* SEO Heading */}
          <h2 
            id="seo-content-heading" 
            className="font-serif text-[26px] sm:text-[34px] font-medium text-white tracking-[-0.01em] mb-6"
          >
            Original Paintings for Homes, Offices & Modern Spaces
          </h2>
          
          {/* SEO Body Text */}
          <div className="space-y-6 text-stone-300 text-[15px] sm:text-[16px] leading-relaxed font-light">
            <p>
              Discover original paintings from emerging artists on Fameuxarte. Whether you're looking for artwork for your living room, bedroom, home office, corporate office, hotel, restaurant, or commercial space, explore a curated marketplace created to help you find art that feels right for your space.
            </p>
            <p>
              Explore contemporary, abstract, modern, and expressive artwork in different styles, sizes, and price ranges. Discover original art from emerging artists and find a piece that can transform an empty wall into something memorable.
            </p>
          </div>
          
          {/* SEO Internal Links Navigation */}
          <nav 
            className="mt-12 pt-10 border-t border-white/[0.08]" 
            aria-label="Popular artwork categories"
          >
            <ul className="flex flex-wrap gap-x-8 gap-y-5">
              <li>
                <Link 
                  to="/artworks" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Shop Paintings
                </Link>
              </li>
              <li>
                <Link 
                  to="/location/office" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Office Wall Art
                </Link>
              </li>
              <li>
                <Link 
                  to="/location/home" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Paintings for Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/location/living-room" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Living Room Paintings
                </Link>
              </li>
              <li>
                <Link 
                  to="/style/abstract" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Abstract Paintings
                </Link>
              </li>
              <li>
                <Link 
                  to="/style/contemporary" 
                  className="text-[14px] text-stone-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Contemporary Art
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default HomeSeoContent;
