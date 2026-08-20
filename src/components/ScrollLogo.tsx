'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Register the ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set these to the actual width/height of your extracted image frames
    canvas.width = 1920; 
    canvas.height = 1080;

    // 2. Setup your frame data
    const frameCount = 40;
    const currentFrame = (index: number) => {
      return `/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;
    };

    const images: HTMLImageElement[] = [];
    const frames = { frame: 0 };

    // 3. Preload all 40 frames into the browser cache for instant playback
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    // 4. Function to draw the current frame to the canvas
    const render = () => {
      const img = images[frames.frame];
      if (img?.complete && img.width > 0) {
        // Ensure canvas matches image aspect ratio/dimensions
        if (canvas.width !== img.width) {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      }
    };

    images[0].onload = render;

    // 5. The "Antigravity" Scroll Logic
    const animation = gsap.to(frames, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none', 
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, 
      },
      onUpdate: render,
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-obsidian pointer-events-none flex items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="max-w-full max-h-full object-contain opacity-30" 
      />
      {/* Optional gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/80 mix-blend-multiply" />
    </div>
  );
}
