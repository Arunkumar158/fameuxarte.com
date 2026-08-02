import { useEffect, useState } from "react";

export const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScrollY = window.scrollY;
      let scrollHeight = document.body.scrollHeight - window.innerHeight;
      
      // Try to limit to article content only if possible
      const article = document.querySelector('article');
      if (article) {
        scrollHeight = article.clientHeight - window.innerHeight;
      }
      
      if (scrollHeight > 0) {
        setProgress(Number((currentScrollY / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div 
        className="h-full bg-gold transition-all duration-150 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};
