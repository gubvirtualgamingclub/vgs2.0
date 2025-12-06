'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { getFeaturedActivities, getDashboardStats, getFeaturedSponsors } from '@/lib/supabase-queries';
import type { Activity, Sponsor } from '@/lib/types/database';

// Dynamic imports for performance - these are heavy animation components
const ScrollAnimation = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollAnimation),
  { ssr: false }
);
const GamingCursor = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.GamingCursor),
  { ssr: false }
);
const FloatingIcons = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.FloatingIcons),
  { ssr: false }
);
const ScrollProgressBar = dynamic(
  () => import('@/components/ScrollAnimations').then(mod => mod.ScrollProgressBar),
  { ssr: false }
);

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    committeeMembers: 0,
    activities: 0,
    yearsActive: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [activitiesData, sponsorsData, dashboardStats] = await Promise.all([
          getFeaturedActivities(),
          getFeaturedSponsors(),
          getDashboardStats(),
        ]);
        
        // Get featured activities for carousel
        setActivities(activitiesData);
        // Get featured sponsors/collaborators
        setSponsors(sponsorsData);
        
        setStats({
          committeeMembers: dashboardStats.committeeMembers,
          activities: dashboardStats.activities,
          yearsActive: dashboardStats.committees,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Carousel auto-rotation effect
  useEffect(() => {
    if (activities.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activities.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activities.length, isPaused]);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Navigate to next/previous slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activities.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activities.length) % activities.length);
  };

  // Interactive particle background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.5)'; // Cyan color
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((particle2) => {
          const dx = particle.x - particle2.x;
          const dy = particle.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Mouse interaction
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx -= (dx / distance) * force * 0.2;
          particle.vy -= (dy / distance) * force * 0.2;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen crt-effect">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* Hero Section with Interactive Background */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden min-h-screen flex items-center">
        {/* Interactive Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
          style={{ opacity: 0.6 }}
        />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}></div>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="text-center">
            <div className="inline-block mb-8 animate-fadeInDown">
              <span className="px-6 py-3 bg-cyan-500/20 backdrop-blur-md rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg border border-cyan-500/30 glow-text">
                🎮 Welcome to VGS 🎮
              </span>
            </div>
            
            {/* Animated Gaming Society Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-8xl font-black mb-2 leading-tight tracking-tight">
                <span className="block bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent animate-gradient gaming-text">
                  GUCC VIRTUAL
                </span>
                <span className="block text-white animate-fadeInUp gaming-text">
                  GAMING SOCIETY
                </span>
              </h1>
            </div>
            
            <p className="text-2xl md:text-3xl font-light mb-6 text-cyan-100 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              ⚡ Where Gamers Unite, Compete, and Excel ⚡
            </p>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-gray-300 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              Join the ultimate gaming community where passion meets competition. 
              Experience epic tournaments, weekly events, and forge lasting friendships.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Link
                href="/activities"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-semibold text-lg shadow-2xl hover:shadow-cyan-400/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Explore Events
              </Link>
              <Link
                href="/committee"
                className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Meet the Team
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="currentColor" className="text-white dark:text-gray-900"/>
          </svg>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
          
          .animate-fadeInDown {
            animation: fadeInDown 0.8s ease-out;
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out;
          }
          
          .gaming-text {
            text-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 
                         0 0 40px rgba(34, 211, 238, 0.3),
                         0 0 60px rgba(34, 211, 238, 0.2);
          }
          
          .glow-text {
            text-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
          }
        `}</style>
      </section>

      {/* Who We Are Section - About Us with Mission & Vision */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - About Us */}
            <ScrollAnimation animation="slideRight" delay={100}>
              <div className="space-y-6">
                {/* Tag */}
                <div className="inline-block">
                  <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    About Us
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  Who We Are
                </h2>
                
                {/* Description */}
                <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>
                    Founded by passionate gamers, the <span className="font-semibold text-cyan-400 dark:text-cyan-400">Virtual Gaming Society (VGS)</span> brings together students from all disciplines who share a love for gaming.
                  </p>
                  <p>
                    We are more than just a club – we&rsquo;re a vibrant community dedicated to fostering skill development, teamwork, and competitive spirit. Our society provides a platform for gamers to connect, compete, and grow together.
                  </p>
                  <p>
                    From hosting exciting tournaments and workshops to organizing community events throughout the year, VGS is committed to promoting responsible gaming, sportsmanship, and building lasting friendships in the gaming world.
                  </p>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.committeeMembers}+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activities}+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Events</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.yearsActive}+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Years</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Right Side - Mission & Vision Cards */}
            <div className="space-y-6">
              {/* Mission Card */}
              <ScrollAnimation animation="flipIn" delay={200}>
                <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-700 dark:border-slate-700">
                  <div className="absolute -top-6 left-8 w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 flex items-center gap-2">
                    🎯 Our Mission
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To create an inclusive gaming community that fosters skill development, 
                    teamwork, and competitive spirit while promoting responsible gaming and 
                    sportsmanship among students.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Vision Card */}
              <ScrollAnimation animation="flipIn" delay={400}>
                <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-700 dark:border-slate-700">
                  <div className="absolute -top-6 left-8 w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 flex items-center gap-2">
                    👁️ Our Vision
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To become the leading university gaming society, recognized for nurturing 
                    esports talent, organizing world-class tournaments, and building a 
                    vibrant gaming culture on campus.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Our Impact in Numbers */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="zoomIn" delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Our Impact in Numbers
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Growing stronger together, one game at a time
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Members */}
            <ScrollAnimation animation="bounceIn" delay={200}>
              <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-400 dark:border-cyan-500 pulse-glow">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-center pt-6">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text mb-2 animate-pulse">
                  {stats.committeeMembers}+
                </div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Active Members
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Passionate gamers united
                </p>
              </div>
            </div>
            </ScrollAnimation>

            {/* Total Events */}
            <ScrollAnimation animation="bounceIn" delay={400}>
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200 dark:border-purple-800 pulse-glow">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center pt-6">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-2 animate-pulse" style={{ animationDelay: '0.2s' }}>
                  {stats.activities}+
                </div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Total Events
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Tournaments & activities hosted
                </p>
              </div>
            </div>
            </ScrollAnimation>

            {/* Years of Excellence */}
            <ScrollAnimation animation="bounceIn" delay={600}>
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-500 dark:border-cyan-500 pulse-glow">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-center pt-6">
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text mb-2 animate-pulse" style={{ animationDelay: '0.4s' }}>
                  {stats.yearsActive}+
                </div>
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Years of Excellence
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Building gaming culture
                </p>
              </div>
            </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Featured Activities Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="glitch" delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Activities
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Check out our upcoming and ongoing gaming events
              </p>
            </div>
          </ScrollAnimation>

          {loading ? (
            <div className="relative h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl animate-pulse"></div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Featured Activities</h3>
              <p className="text-gray-600 dark:text-gray-400">Featured activities will appear here once added by admin</p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div 
                className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentSlide 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    {/* Full Background Image/Gradient - Main Focus */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                      {/* Subtle animated background pattern */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
                      </div>
                      
                      {/* Decorative grid pattern overlay */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                      }}></div>
                    </div>

                    {/* Minimal Content Overlay - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-16 sm:pt-24 md:pt-32 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-8 md:px-12 lg:px-16">
                      <div className="max-w-7xl mx-auto">
                        <div className="max-w-4xl">
                          {/* Category Badge */}
                          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full mb-2 sm:mb-3 md:mb-4 border border-white/20">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider">{activity.category}</span>
                          </div>

                          {/* Title - Prominent but not overwhelming */}
                          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-2xl line-clamp-2">
                            {activity.title}
                          </h3>

                          {/* Short Description */}
                          <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-3 sm:mb-4 leading-relaxed line-clamp-2 max-w-3xl drop-shadow-lg">
                            {activity.description}
                          </p>

                          {/* Meta Information - Compact */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                            <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{activity.date}</span>
                            </div>
                            <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{activity.time}</span>
                            </div>
                            <div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium line-clamp-1">{activity.venue}</span>
                            </div>
                          </div>

                          {/* Call to Action - Subtle */}
                          <Link
                            href={`/activities/${activity.slug}`}
                            className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                          >
                            Learn More
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - Sleek Design */}
              {activities.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 group z-10 shadow-xl"
                    aria-label="Previous slide"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 group z-10 shadow-xl"
                    aria-label="Next slide"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Navigation - Clean & Modern */}
              {activities.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-2.5 z-10">
                  {activities.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full border-2 ${
                        index === currentSlide 
                          ? 'w-8 sm:w-10 h-2.5 sm:h-3 bg-white border-white' 
                          : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-transparent border-white/60 hover:border-white hover:bg-white/30'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Pause Indicator - Minimal */}
              {isPaused && activities.length > 1 && (
                <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 z-10 shadow-lg">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-xs sm:text-sm font-medium">Paused</span>
                  </div>
                </div>
              )}

              {/* Slide Counter - Top Left */}
              {activities.length > 1 && (
                <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 z-10 shadow-lg">
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {currentSlide + 1} / {activities.length}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/activities"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              View All Activities
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sponsors Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="pixel" delay={100}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Our Sponsors & Collaborators
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Partnering with industry leaders to create amazing experiences
              </p>
            </div>
          </ScrollAnimation>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col animate-pulse">
                  {/* Featured Star Placeholder */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  
                  {/* Logo Container */}
                  <div className="flex-1 p-8 flex items-center justify-center min-h-[200px]">
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5">
                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-3"></div>
                    <div className="flex justify-center gap-2">
                      <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Featured Partners Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">We&rsquo;re building partnerships with amazing organizations!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sponsors.map((sponsor, index) => {
                return (
                  <ScrollAnimation key={sponsor.id} animation="zoomIn" delay={index * 100}>
                  <Link
                    href="/sponsors"
                    className="group relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-purple-400/50 hover:border-purple-400 shadow-lg hover:shadow-purple-400/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col"
                  >
                    {/* Featured Star Badge */}
                    <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>

                    {/* Logo Container - Takes most space */}
                    <div className="flex-1 p-8 flex items-center justify-center min-h-[200px]">
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 group-hover:scale-105 filter group-hover:brightness-110"
                          style={{ maxHeight: '180px' }}
                        />
                      </div>
                    </div>

                    {/* Bottom Info Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5">
                      {/* Name */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-3 line-clamp-2 min-h-[3rem] flex items-center justify-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {sponsor.name}
                      </h3>

                      {/* Badges Row */}
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Custom Type Name Badge */}
                        {sponsor.custom_type_name && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-sm">
                            {sponsor.custom_type_name}
                          </span>
                        )}
                        
                        {/* Multiple Sponsor Type Badges */}
                        {sponsor.sponsor_types && sponsor.sponsor_types.length > 0 && sponsor.sponsor_types.map((type: string) => (
                          <span key={type} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-sm">
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                        
                        {/* Multiple Collaborator Type Badges */}
                        {sponsor.collaborator_types && sponsor.collaborator_types.length > 0 && sponsor.collaborator_types.map((type: string) => (
                          <span key={type} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-sm">
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                        
                        {/* Type Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sponsor.type === 'sponsor' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          {sponsor.type === 'sponsor' ? '🏢 Sponsor' : '🤝 Partner'}
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 via-transparent to-transparent group-hover:from-purple-600/5 transition-all duration-500 pointer-events-none rounded-3xl"></div>
                  </Link>
                  </ScrollAnimation>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/sponsors"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              View All Partners
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
