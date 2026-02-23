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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Animated Background Elements with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: moveX, y: moveY }}
          className="absolute -inset-[20px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-3xl"
        />
        <motion.div
          style={{ x: useTransform(springX, [0, 1], [30, -30]), y: useTransform(springY, [0, 1], [30, -30]) }}
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ x: useTransform(springX, [0, 1], [-40, 40]), y: useTransform(springY, [0, 1], [-40, 40]) }}
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-4 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl transform group-hover:scale-110 transition-transform duration-700" />

          <motion.h1
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {/* FAMEUXARTE */}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          >
            Art Gallery for the unseen artists
          </motion.p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 max-w-xl text-lg md:text-xl text-white/90 font-light tracking-wide"
        >
          <span className="text-purple-300">VISION.</span>{" "}
          <span className="text-pink-300">INSPIRE.</span>{" "}
          <span className="text-blue-300">COLLECT</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button asChild size="lg" className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 group rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25">
            <Link to="/artworks" className="flex items-center gap-2">
              <span className="relative z-10">Explore Artworks</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/20 to-purple-500/0"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="relative overflow-hidden bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/5 rounded-lg transition-all duration-300 group hover:scale-105 active:scale-95">
            <Link to="/artists" className="relative">
              <span className="relative z-10">Meet the Artists</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
