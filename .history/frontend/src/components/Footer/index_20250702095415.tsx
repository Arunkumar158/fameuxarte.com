"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-white pt-16 dark:bg-gray-dark md:pt-20 lg:pt-24">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          {/* Company Info */}
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
            <div className="mb-12 max-w-[360px] lg:mb-16">
              <Link href="/" className="mb-8 inline-block">
                <Image
                  src="/images/logo/logo-2.svg"
                  alt="logo"
                  className="w-full dark:hidden"
                  width={140}
                  height={30}
                />
                <Image
                  src="/images/logo/logo.svg"
                  alt="logo"
                  className="hidden w-full dark:block"
                  width={140}
                  height={30}
                />
              </Link>
              <div className="mb-9 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                <h1 className="font-semibold mb-2">Our Vision</h1>
                <p>
                  We believe that every piece of art tells a story, and we are
                  dedicated to bringing those stories to life. Whether you are an
                  artist looking for exposure or an art lover searching for
                  unique pieces, Fameuxarte is your go-to destination.
                </p>
              </div>
              {/* Social Links */}
              <div className="flex items-center">
                <a href="https://www.facebook.com/profile.php?id=100095552972067/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="mr-6 text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                  {/* Facebook SVG */}
                </a>
                <a href="https://x.com/Fameuxarte/" target="_blank" rel="noopener noreferrer" aria-label="X" className="mr-6 text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                  {/* Twitter/X SVG */}
                </a>
                <a href="https://www.youtube.com/@FameuxArte/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="mr-6 text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                  {/* YouTube SVG */}
                </a>
                <a href="https://www.linkedin.com/company/fameux-arte/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                  {/* LinkedIn SVG */}
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-black dark:text-white">Company</h2>
              <ul>
                <li>
                  <Link href="/blog/our-story" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Links */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-black dark:text-white">Legal</h2>
              <ul>
                <li>
                  <Link href="/policies" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/policies" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Support Links */}
          <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
            <div className="mb-12 lg:mb-16">
              <h2 className="mb-10 text-xl font-bold text-black dark:text-white">Support</h2>
              <ul>
                <li>
                  <Link href="/contact" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    Join our newsletter
                  </Link>
                </li>
                <li>
                  <Link href="/b2b" className="mb-4 inline-block text-base text-body-color hover:text-primary dark:text-body-color-dark dark:hover:text-primary">
                    B2B
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]"></div>

        {/* Copyright */}
        <div className="py-8 text-center text-base text-body-color dark:text-white">
          Copyright © 2025{" "}
          <span className="hover:text-primary font-medium">@Fameuxarte</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
