"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-right" | "zoom-in" | "blueprint-draw";
  delay?: number;
}

export function Reveal({ children, animation = "fade-up", delay = 0 }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const styles = {
    "fade-up": `translate-y-12 opacity-0 transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1)`,
    "fade-right": `-translate-x-12 opacity-0 transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1)`,
    "zoom-in": `scale-95 opacity-0 transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1)`,
    "blueprint-draw": `opacity-0 transition-all duration-1500`,
  };

  const visibleStyles = {
    "fade-up": `translate-y-0 opacity-100`,
    "fade-right": `translate-x-0 opacity-100`,
    "zoom-in": `scale-100 opacity-100`,
    "blueprint-draw": `opacity-100`,
  };

  return (
    <div 
      ref={ref}
      className={`${styles[animation]} ${isVisible ? visibleStyles[animation] : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
