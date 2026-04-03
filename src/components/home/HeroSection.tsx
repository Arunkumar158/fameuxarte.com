import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const moveX = useTransform(springX, [0, 1], [-20, 20]);
  const moveY = useTransform(springY, [0, 1], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth);
    mouseY.set(clientY / innerHeight);
  };

  return (
    <section
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: "url('/media/image/WhatsApp Image 2025-10-09 at 12.10.39 PM.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        minHeight: '80vh'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Animated Background Elements with Parallax - Subtle Gold */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen">
        <motion.div
          style={{ x: useTransform(springX, [0, 1], [30, -30]), y: useTransform(springY, [0, 1], [30, -30]) }}
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-gold/5 rounded-full blur-[100px]"
        />
        <motion.div
          style={{ x: useTransform(springX, [0, 1], [-40, 40]), y: useTransform(springY, [0, 1], [-40, 40]) }}
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-gold/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-6 group"
        >
          <div className="absolute inset-0 bg-brand-gold/10 blur-[80px] transform group-hover:scale-110 transition-transform duration-700" />

          <motion.h1
            className="relative text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-sm leading-tight"
          >
            Discover Real Artists.<br />Own Authentic Art.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative text-xl md:text-2xl font-medium text-brand-gold/90 max-w-2xl mx-auto"
          >
            A curated platform built for trust, emotion, and originality.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-6"
        >
          <Button asChild size="lg" className="btn-primary h-14 px-8 text-lg rounded-full">
            <Link to="/artworks" className="flex items-center gap-2">
              <span>Explore Collection</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="btn-secondary h-14 px-8 text-lg rounded-full bg-black/40 backdrop-blur-md">
            <Link to="/artists">
              <span>Meet the Artists</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
