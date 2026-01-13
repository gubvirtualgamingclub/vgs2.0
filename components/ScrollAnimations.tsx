'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'flipIn' | 'bounceIn' | 'glitch' | 'pixel' | 'gameOver';
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollAnimation({ 
  children, 
  animation = 'fadeIn', 
  delay = 0, 
  duration = 0.6,
  className = '' 
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  const animationClasses = {
    fadeIn: 'opacity-0 animate-fade-in',
    slideUp: 'opacity-0 translate-y-20 animate-slide-up',
    slideLeft: 'opacity-0 translate-x-20 animate-slide-left',
    slideRight: 'opacity-0 -translate-x-20 animate-slide-right',
    zoomIn: 'opacity-0 scale-75 animate-zoom-in',
    flipIn: 'opacity-0 rotate-y-90 animate-flip-in',
    bounceIn: 'opacity-0 scale-50 animate-bounce-in',
    glitch: 'opacity-0 animate-glitch-in',
    pixel: 'opacity-0 animate-pixel-in',
    gameOver: 'opacity-0 scale-150 animate-game-over'
  };

  return (
    <div
      ref={elementRef}
      className={`scroll-animation ${animationClasses[animation]} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
}

// Parallax scroll effect for gaming elements
export function ParallaxElement({ 
  children, 
  speed = 0.5,
  className = '' 
}: { 
  children: ReactNode; 
  speed?: number;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const scrolled = window.pageYOffset;
        const rect = elementRef.current.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementVisible = scrolled + window.innerHeight > elementTop;

        if (elementVisible) {
          const yPos = -(scrolled - elementTop) * speed;
          elementRef.current.style.transform = `translateY(${yPos}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={elementRef} className={`parallax-element ${className}`}>
      {children}
    </div>
  );
}

// Gaming cursor trail effect
export function GamingCursor() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      color: string;
    }> = [];

    let mouseX = 0;
    let mouseY = 0;

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Create particle
      particles.push({
        x: mouseX,
        y: mouseY,
        size: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.02;
        particle.size *= 0.98;

        if (particle.life <= 0 || particle.size < 0.5) {
          particles.splice(index, 1);
        } else {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeChild(canvas);
    };
  }, []);

  return null;
}

// Floating gaming icons background
const ICONS = ['🎮', '🕹️', '👾', '🎯', '⚡', '🏆', '🎪', '🎨', '🎭', '🎬'];

export function FloatingIcons() {
  const [positions, setPositions] = useState<Array<{left: string, top: string, delay: string, duration: string}>>([]);

  useEffect(() => {
    setPositions(
      ICONS.map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${15 + Math.random() * 10}s`
      }))
    );
  }, []); // Only run once on mount (client-side)
  
  if (positions.length === 0) return null; // Don't render until positions are set

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {ICONS.map((icon, index) => (
        <div
          key={index}
          className="absolute text-4xl opacity-10 animate-float"
          style={{
            left: positions[index]?.left || '0%',
            top: positions[index]?.top || '0%',
            animationDelay: positions[index]?.delay || '0s',
            animationDuration: positions[index]?.duration || '20s'
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

// Progress bar on scroll
export function ScrollProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (progressRef.current) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressRef.current.style.width = `${scrolled}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
      <div
        ref={progressRef}
        className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-all duration-150 shadow-lg shadow-purple-500/50"
        style={{ width: '0%' }}
      />
    </div>
  );
}

// Retro gaming text effect
export function RetroText({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={`retro-text ${className}`}>
      <span className="retro-text-shadow">{children}</span>
      <span className="retro-text-main">{children}</span>
    </div>
  );
}

// Gaming achievement popup
export function AchievementNotification({ 
  title, 
  description,
  show,
  onClose
}: { 
  title: string; 
  description: string;
  show: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 rounded-lg shadow-2xl p-4 max-w-sm border-4 border-yellow-300">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🏆</div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">Achievement Unlocked!</h4>
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-90">{description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
