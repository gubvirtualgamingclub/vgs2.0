'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { getFeaturedActivities, getDashboardStats, getFeaturedSponsors } from '@/lib/supabase-queries';
import type { Activity, Sponsor } from '@/lib/types/database';

// Dynamic imports for performance
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
        
        setActivities(activitiesData);
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

  // Carousel auto-rotation
  useEffect(() => {
    if (activities.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activities.length, isPaused]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activities.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activities.length) % activities.length);

  // 🌌 ANTI-GRAVITY HERO ANIMATION 🌌
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Physics constants
    const FRICTION = 0.98;
    const MOUSE_REPULSION = 2; // Stronger push
    const GRAVITY = 0; // Space-like zero gravity

    class Shape {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        rotation: number;
        rotationSpeed: number;
        type: 'square' | 'triangle' | 'pentagon';
        color: string;
        
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Initial gentle drift
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 30 + 15; // varying sizes
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            const types = ['square', 'triangle', 'pentagon'] as const;
            this.type = types[Math.floor(Math.random() * types.length)];
            // Premium colors: Cyan, Purple, Blue - reduced opacity for glass feel
            const colors = ['rgba(6, 182, 212, 0.15)', 'rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.15)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Mouse Interaction - "Antigravity Repulsion"
            const dx = this.x - mousePos.current.x;
            const dy = this.y - mousePos.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 250) { // Interaction radius
                const angle = Math.atan2(dy, dx);
                const force = (250 - dist) / 250;
                const push = force * MOUSE_REPULSION;
                
                this.vx += Math.cos(angle) * push;
                this.vy += Math.sin(angle) * push;
            }

            // Apply movement
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            // Apply friction (air resistance)
            this.vx *= FRICTION;
            this.vy *= FRICTION;

            // Keep in constant slow motion if too slow
            if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.05;
            if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.05;

            // Bounce off walls (elastic collision)
            if (this.x < 0) { this.x = 0; this.vx *= -1; }
            if (this.x > width) { this.x = width; this.vx *= -1; }
            if (this.y < 0) { this.y = 0; this.vy *= -1; }
            if (this.y > height) { this.y = height; this.vy *= -1; }
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color.replace('0.15)', '0.4)'); // Brighter border
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            if (this.type === 'square') {
                ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
            } else if (this.type === 'triangle') {
                ctx.moveTo(0, -this.size/2);
                ctx.lineTo(this.size/2, this.size/2);
                ctx.lineTo(-this.size/2, this.size/2);
                ctx.closePath();
            } else if (this.type === 'pentagon') {
                const sides = 5;
                const radius = this.size/2;
                for (let i = 0; i < sides; i++) {
                     const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                     const x = Math.cos(angle) * radius;
                     const y = Math.sin(angle) * radius;
                     if (i === 0) ctx.moveTo(x, y);
                     else ctx.lineTo(x, y);
                }
                ctx.closePath();
            }
            
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    const shapes: Shape[] = Array.from({ length: 40 }, () => new Shape());

    function animate() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, width, height);
        
        // Draw connection lines for nearby shapes (Constellation effect)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < shapes.length; i++) {
            for (let j = i + 1; j < shapes.length; j++) {
                const dx = shapes[i].x - shapes[j].x;
                const dy = shapes[i].y - shapes[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(shapes[i].x, shapes[i].y);
                    ctx.lineTo(shapes[j].x, shapes[j].y);
                    ctx.stroke();
                }
            }
        }

        shapes.forEach(shape => {
            shape.update();
            shape.draw(ctx);
        });
        requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Gaming Enhancements */}
      <ScrollProgressBar />
      <GamingCursor />
      <FloatingIcons />
      
      {/* 🚀 PREMIUM HERO SECTION 🚀 */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
        {/* Antigravity Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 z-0"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-6 animate-fadeInDown">
            <span className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              Est. 2024 • Excellence in Esports
            </span>
          </div>

          {/* Main Title with Premium Metallic Sheen Animation */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-none px-4">
             <span className="block text-transparent bg-clip-text bg-[linear-gradient(to_right,theme(colors.gray.600),theme(colors.white),theme(colors.gray.600))] animate-shimmer-text bg-[length:200%_auto]">
               GUCC VIRTUAL
             </span>
             <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mt-2 filter drop-shadow-2xl">
               GAMING SOCIETY
             </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light tracking-wide leading-relaxed animate-fadeInUp delay-100">
            The premier collegiate gaming organization. <br className="hidden md:block"/>
            <span className="text-cyan-400 font-medium">Competitions</span>, <span className="text-purple-400 font-medium">Community</span>, and <span className="text-pink-400 font-medium">Careers</span> in Esports.
          </p>

          {/* Premium Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp delay-200">
            <Link
              href="/activities"
              className="group relative px-8 py-4 bg-white text-black text-lg font-bold rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                Explore Events <span className="text-xl">→</span>
              </span>
            </Link>
            
            <Link
              href="/committee"
              className="group px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-lg font-bold hover:bg-white/10 transition-all hover:scale-105 hover:border-white/30"
            >
              Meet the Team
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* 📜 WHO WE ARE 📜 */}
      <section className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Defining the Future of <br/><span className="text-cyan-400">University Esports</span></h2>
                 <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
                    <p>
                       The Virtual Gaming Society (VGS) is not just a club; it's a movement. We are building an ecosystem where competitive gamers, content creators, and casual players thrive together.
                    </p>
                    <p>
                       With a focus on professional development and competitive integrity, we provide the stage for the next generation of esports talent to shine.
                    </p>
                 </div>
                 
                 {/* Stats */}
                 <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
                    <div>
                       <div className="text-4xl font-bold text-white mb-1">{stats.committeeMembers}+</div>
                       <div className="text-sm text-gray-500 uppercase tracking-wider">Members</div>
                    </div>
                    <div>
                       <div className="text-4xl font-bold text-white mb-1">{stats.activities}+</div>
                       <div className="text-sm text-gray-500 uppercase tracking-wider">Events</div>
                    </div>
                     <div>
                       <div className="text-4xl font-bold text-white mb-1">{stats.yearsActive}+</div>
                       <div className="text-sm text-gray-500 uppercase tracking-wider">Years</div>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-6">
                 {/* Mission Card */}
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-cyan-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                    <p className="text-gray-400">To create an inclusive ecosystem that nurtures talent, promotes sportsmanship, and elevates university esports to professional standards.</p>
                 </div>
                 
                 {/* Vision Card */}
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <span className="text-2xl">👁️</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                    <p className="text-gray-400">To be the gold standard for collegiate gaming societies globally, fostering a community where passion meets opportunity.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 🎮 FEATURED ACTIVITIES 🎮 */}
      <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <span className="text-cyan-400 font-bold tracking-wider uppercase text-sm">Action Packed</span>
             <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Featured Events</h2>
          </div>

          {!loading && activities.length > 0 ? (
             <div className="relative group">
                <div className="relative h-[600px] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                   {activities.map((activity, index) => (
                      <div 
                         key={activity.id}
                         className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                      >
                         {/* Card Bg */}
                         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 mix-blend-overlay z-10"></div>
                         
                         {/* Dynamic Banner Image */}
                         {activity.banner_image_url ? (
                             <div 
                                className="absolute inset-0 bg-cover bg-center grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                                style={{ backgroundImage: `url(${activity.banner_image_url})` }}
                             />
                         ) : (
                             /* Fallback Abstract Pattern */
                             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"></div>
                         )}

                         <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
                            <div className="max-w-4xl">
                               <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider text-white border border-white/20 mb-4 inline-block">
                                  {activity.category}
                               </span>
                               <h3 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{activity.title}</h3>
                               <p className="text-lg text-gray-300 line-clamp-2 max-w-2xl mb-8 font-light">{activity.description}</p>
                               
                               <Link href={`/activities/${activity.slug}`} className="inline-flex items-center px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors">
                                  Event Details
                               </Link>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                
                {/* Controls */}
                <div className="absolute bottom-12 right-12 z-30 flex gap-4">
                   <button onClick={prevSlide} className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all hover:scale-110">←</button>
                   <button onClick={nextSlide} className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all hover:scale-110">→</button>
                </div>
             </div>
          ) : (
             <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <p className="text-gray-500">No active events found</p>
             </div>
          )}
        </div>
      </section>

      {/* 🤝 SPONSORS 🤝 */}
      <section className="py-24 bg-gray-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Our Featured Partners</h2>
               <p className="text-gray-400">Powering the next generation of gamers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
               {sponsors.length > 0 ? sponsors.map((sponsor, i) => (
                  <div key={i} className="group relative bg-[#0f0f10] border border-white/5 rounded-2xl p-6 flex flex-col items-center hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/10">
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                      
                      {/* Logo Area */}
                      <div className="relative z-10 w-full h-32 flex items-center justify-center mb-6 p-2">
                           <img 
                              src={sponsor.logo} 
                              alt={sponsor.name} 
                              className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105" 
                           />
                      </div>

                      {/* Info & Tags */}
                      <div className="relative z-10 w-full text-center">
                          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{sponsor.name}</h3>
                          
                          {/* Event Tags */}
                          {sponsor.events && sponsor.events.length > 0 ? (
                             <div className="flex flex-wrap justify-center gap-2">
                                {sponsor.events.slice(0, 3).map((event, idx) => (
                                   <span key={idx} className="px-2 py-1 bg-white/5 text-xs text-gray-400 rounded-md border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-colors">
                                      {event}
                                   </span>
                                ))}
                                {sponsor.events.length > 3 && (
                                   <span className="px-2 py-1 bg-white/5 text-xs text-gray-400 rounded-md border border-white/5">
                                      +{sponsor.events.length - 3}
                                   </span>
                                )}
                             </div>
                          ) : (
                             <div className="h-6"></div> /* Spacer if no tags */
                          )}
                      </div>
                  </div>
               )) : (
                  // Placeholders
                  [1,2,3,4].map(i => (
                     <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center animate-pulse">
                        <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">Partner Slot</span>
                     </div>
                  ))
               )}
            </div>

            {/* View All Button */}
            <div className="text-center">
               <Link 
                  href="/sponsors" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 hover:border-cyan-500/50 transition-all group"
               >
                  <span>See All Our Partners</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
               </Link>
            </div>
         </div>
      </section>

      {/* Animations CSS */}
      <style jsx global>{`
        @keyframes shimmer-text {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shimmer-text {
          animation: shimmer-text 8s linear infinite;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease-out forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
