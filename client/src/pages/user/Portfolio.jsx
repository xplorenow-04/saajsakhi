import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hls from "hls.js";
import { FiArrowUpRight, FiArrowRight } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

// Custom Loading Screen
function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Design", "Create", "Inspire"];

  useEffect(() => {
    // Counter animation
    let startTimestamp = null;
    const duration = 2700;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * 100);
      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    window.requestAnimationFrame(step);

    // Rotating words cycle
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 900);

    return () => clearInterval(wordInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col justify-between p-6 md:p-12 select-none">
      {/* Top Left */}
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs text-neutral-500 uppercase tracking-[0.3em] font-body font-bold"
        >
          Portfolio
        </motion.div>
      </div>

      {/* Center Word Rotator */}
      <div className="flex justify-center items-center h-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-4xl md:text-7xl font-display italic text-[#f5f5f5]"
          >
            {words[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Display */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-body">
            Michael Smith © 2026
          </div>
          <div className="text-6xl md:text-9xl font-display text-[#f5f5f5] tabular-nums leading-none">
            {String(count).padStart(3, "0")}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[3px] bg-neutral-900/50 rounded-full overflow-hidden relative">
          <div
            className="accent-gradient h-full absolute left-0 top-0 origin-left transition-transform duration-75"
            style={{
              width: "100%",
              transform: `scaleX(${count / 100})`,
              boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const videoRef = useRef(null);
  const footerVideoRef = useRef(null);
  const heroRef = useRef(null);
  const nameRef = useRef(null);
  const eyebrowRef = useRef(null);

  // Parallax Gallery Scroll References
  const pinSectionRef = useRef(null);
  const pinContentRef = useRef(null);
  const colLeftRef = useRef(null);
  const colRightRef = useRef(null);

  // Footer Marquee Reference
  const marqueeRef = useRef(null);

  const roles = ["Creative", "Fullstack", "Founder", "Scholar"];

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Roles Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // HLS stream bindings
  useEffect(() => {
    const streamUrl =
      "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

    // Bind Hero Video
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = streamUrl;
      }
    }

    // Bind Footer Video
    if (footerVideoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(footerVideoRef.current);
      } else if (footerVideoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        footerVideoRef.current.src = streamUrl;
      }
    }
  }, [isLoading]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (isLoading) return;

    // Hero entrance
    const tl = gsap.timeline();
    tl.fromTo(
      ".name-reveal",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
      0.1
    );

    tl.fromTo(
      ".blur-in",
      { opacity: 0, filter: "blur(10px)", y: 20 },
      { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1, ease: "power3.out" },
      0.3
    );

    // Explorations Parallax Pinning
    const pinCtx = gsap.context(() => {
      // Pin the center text section
      ScrollTrigger.create({
        trigger: pinSectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: pinContentRef.current,
        pinSpacing: false,
      });

      // Scroll-driven Parallax Columns
      gsap.fromTo(
        colLeftRef.current,
        { y: "15%" },
        {
          y: "-15%",
          scrollTrigger: {
            trigger: pinSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        colRightRef.current,
        { y: "-10%" },
        {
          y: "20%",
          scrollTrigger: {
            trigger: pinSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Footer Infinite Marquee
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: "none",
      });
    });

    return () => {
      pinCtx.revert();
    };
  }, [isLoading]);

  // Projects data
  const projects = [
    {
      id: 1,
      title: "Automotive Motion",
      category: "CGI & Interaction",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop",
      span: "md:col-span-7",
      aspect: "aspect-[16/10]",
    },
    {
      id: 2,
      title: "Urban Architecture",
      category: "Minimalist Space",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      span: "md:col-span-5",
      aspect: "aspect-[4/5]",
    },
    {
      id: 3,
      title: "Human Perspective",
      category: "Creative Study",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
      span: "md:col-span-5",
      aspect: "aspect-[4/5]",
    },
    {
      id: 4,
      title: "Brand Identity",
      category: "Digital Direction",
      image: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?q=80&w=1200&auto=format&fit=crop",
      span: "md:col-span-7",
      aspect: "aspect-[16/10]",
    },
  ];

  // Journal entries
  const journals = [
    {
      id: 1,
      title: "Design systems for massive scale digital products",
      date: "May 12, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "The nuance of micro-interactions and motion curves",
      date: "Apr 28, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "How artificial intelligence transforms user onboarding",
      date: "Mar 15, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Building immersive narrative sites with Web3 integrations",
      date: "Feb 09, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=300&auto=format&fit=crop",
    },
  ];

  // Explorations data
  const explorations = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=500&auto=format&fit=crop",
      rotation: "-rotate-6",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1581404917879-17e19a5e358e?q=80&w=500&auto=format&fit=crop",
      rotation: "rotate-3",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop",
      rotation: "-rotate-3",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=500&auto=format&fit=crop",
      rotation: "rotate-6",
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?q=80&w=500&auto=format&fit=crop",
      rotation: "-rotate-2",
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=500&auto=format&fit=crop",
      rotation: "rotate-2",
    },
  ];

  return (
    <div className="portfolio-theme w-full min-h-screen relative overflow-x-hidden select-none selection:bg-neutral-800 selection:text-neutral-200">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* Floating Header Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <div
          className={`inline-flex items-center rounded-full border border-white/10 bg-neutral-950/80 px-3 py-2 transition-all duration-300 backdrop-blur-md ${
            scrollY > 100 ? "shadow-lg shadow-black/30 scale-95" : ""
          }`}
        >
          {/* Logo */}
          <a
            href="#home"
            className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center relative group overflow-hidden border border-neutral-800 active:scale-95 transition"
          >
            <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 rotate-0 group-hover:rotate-180" />
            <div className="w-[32px] h-[32px] rounded-full bg-neutral-950 flex items-center justify-center z-10">
              <span className="font-display italic text-xs font-bold text-neutral-100">JA</span>
            </div>
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-neutral-800 mx-2 hidden sm:block" />

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {["Home", "Work", "Resume"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-xs rounded-full px-4 py-2 font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40 transition duration-300"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-neutral-800 mx-2" />

          {/* Say Hi Button */}
          <a
            href="#contact"
            className="relative group inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-full py-2 px-4 transition active:scale-95"
          >
            {/* Outline Glow on Hover */}
            <span className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            <span className="absolute inset-0 bg-neutral-900 rounded-full -z-10" />
            <span className="flex items-center gap-1.5 text-neutral-200">
              Say hi <FiArrowUpRight className="text-sm text-neutral-400 group-hover:text-neutral-100 transition" />
            </span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        ref={heroRef}
        className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-[#090909]"
      >
        {/* Background HLS Video */}
        <div className="absolute inset-0 w-full h-full -z-20 select-none pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-25 filter grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/40" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center">
          {/* Eyebrow */}
          <span className="blur-in text-[10px] md:text-xs text-neutral-500 uppercase tracking-[0.4em] font-body font-bold mb-4 inline-block">
            COLLECTION '26
          </span>

          {/* Name */}
          <h1
            ref={nameRef}
            className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display italic font-light tracking-tight text-neutral-100 mb-6"
          >
            Michael Smith
          </h1>

          {/* Dynamic Role */}
          <div className="blur-in text-lg md:text-2xl font-body font-light text-neutral-400 mb-6 flex items-center gap-2">
            <span>A</span>
            <div className="w-24 md:w-32 inline-flex justify-center border-b border-neutral-800 pb-0.5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="font-display italic text-[#e5e5e5]"
                >
                  {roles[roleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <span>lives in Chicago.</span>
          </div>

          {/* Description */}
          <p className="blur-in text-xs md:text-sm text-neutral-500 font-body max-w-md leading-relaxed mb-10">
            Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.
          </p>

          {/* CTAs */}
          <div className="blur-in flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="#work"
              className="relative group rounded-full text-xs font-bold uppercase tracking-wider py-4 px-8 transition duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-[#f5f5f5] rounded-full group-hover:opacity-0 transition-opacity duration-300" />
              <div className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="absolute inset-0 bg-[#0a0a0a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span className="text-[#0a0a0a] group-hover:text-[#f5f5f5] relative font-bold transition">
                See Works
              </span>
            </a>

            <a
              href="#contact"
              className="relative group rounded-full text-xs font-bold uppercase tracking-wider py-4 px-8 border border-neutral-800 bg-[#0a0a0a] text-neutral-200 hover:border-transparent transition duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="absolute inset-0 bg-[#0a0a0a] rounded-full -z-10" />
              <span>Reach out...</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition duration-300">
          <span className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] font-body">SCROLL</span>
          <div className="w-px h-10 bg-neutral-900 relative overflow-hidden">
            <div className="w-full h-3 accent-gradient absolute top-0 left-0 animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* Selected Works Section */}
      <section id="work" className="bg-[#0a0a0a] py-20 md:py-32 relative border-t border-neutral-900/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-neutral-800" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-body font-bold">
                  Selected Work
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display text-neutral-200">
                Featured <span className="italic text-neutral-400">projects</span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-2 max-w-sm font-body leading-relaxed">
                A selection of projects I've worked on, from concept to launch.
              </p>
            </div>

            <a
              href="#work"
              className="relative group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-neutral-100 transition py-2.5 px-5 rounded-full"
            >
              <div className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="absolute inset-0 bg-[#0d0d0d] border border-neutral-800 rounded-full -z-10" />
              <span>View all work</span>
              <FiArrowRight className="text-sm group-hover:translate-x-1 transition duration-300" />
            </a>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`bg-[#0d0d0d] border border-neutral-900 rounded-[32px] overflow-hidden group relative cursor-pointer ${project.span}`}
              >
                {/* Image Container */}
                <div className={`w-full ${project.aspect} overflow-hidden relative`}>
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] filter grayscale hover:grayscale-0"
                  />
                  {/* Halftone Overlay */}
                  <div
                    className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                      backgroundSize: "4px 4px",
                    }}
                  />
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6 md:p-8 backdrop-blur-md">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold font-body">
                      {project.category}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                      <FiArrowUpRight className="text-lg" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-display text-neutral-100 leading-tight">
                      View — <span className="italic">{project.title}</span>
                    </h3>
                  </div>
                </div>

                {/* Mobile Static Label */}
                <div className="p-6 md:hidden flex justify-between items-center border-t border-neutral-900">
                  <div>
                    <h3 className="text-lg font-display italic text-neutral-300">{project.title}</h3>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest">{project.category}</span>
                  </div>
                  <FiArrowRight className="text-neutral-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Section */}
      <section id="resume" className="bg-[#0a0a0a] py-20 md:py-32 relative border-t border-neutral-900/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-neutral-800" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-body font-bold">
                  Journal
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display text-neutral-200">
                Recent <span className="italic text-neutral-400">thoughts</span>
              </h2>
              <p className="text-xs md:text-sm text-neutral-500 mt-2 max-w-sm font-body leading-relaxed">
                A selection of articles I've written covering creative design systems and engineering.
              </p>
            </div>

            <a
              href="#resume"
              className="relative group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-neutral-100 transition py-2.5 px-5 rounded-full"
            >
              <div className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <div className="absolute inset-0 bg-[#0d0d0d] border border-neutral-800 rounded-full -z-10" />
              <span>View all journals</span>
              <FiArrowRight className="text-sm group-hover:translate-x-1 transition duration-300" />
            </a>
          </motion.div>

          {/* Horizontal List */}
          <div className="flex flex-col gap-4">
            {journals.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-[32px] sm:rounded-full bg-[#0e0e0e]/50 border border-neutral-900/50 hover:bg-[#0e0e0e] hover:border-neutral-800 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-neutral-900 border border-neutral-800">
                    <img src={entry.image} alt="" className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition" />
                  </div>
                  {/* Details */}
                  <div>
                    <h3 className="text-sm md:text-base font-body font-bold text-neutral-300 group-hover:text-neutral-100 transition leading-tight">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-neutral-500 font-body">{entry.date}</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-800" />
                      <span className="text-[10px] text-neutral-500 font-body">{entry.readTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 px-4 sm:px-0">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider group-hover:text-neutral-300 transition sm:opacity-0 group-hover:opacity-100 duration-300">
                    Read Article
                  </span>
                  <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-neutral-200 group-hover:rotate-45 transition duration-300">
                    <FiArrowUpRight className="text-lg" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explorations (Parallax Gallery) Section */}
      <section
        id="explorations"
        ref={pinSectionRef}
        className="w-full min-h-[300vh] relative bg-[#090909] py-20 overflow-hidden"
      >
        {/* Layer 1: Pinned Center Heading block */}
        <div
          ref={pinContentRef}
          className="absolute inset-0 h-screen w-full flex items-center justify-center z-10 pointer-events-none select-none"
        >
          <div className="text-center max-w-md px-6 pointer-events-auto">
            <span className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-[0.4em] font-body font-bold mb-4 block">
              EXPLORATIONS
            </span>
            <h2 className="text-5xl md:text-6xl font-display text-neutral-200 leading-none">
              Visual <span className="italic text-neutral-400">playground</span>
            </h2>
            <p className="text-xs text-neutral-500 font-body mt-4 max-w-xs mx-auto leading-relaxed">
              Snapshots of design mockups, renders, experiments, and branding layouts built as exercises.
            </p>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-300 hover:text-neutral-100 transition py-2.5 px-5 rounded-full bg-neutral-950 border border-neutral-800"
            >
              <span>Explore Dribbble</span>
              <FiArrowUpRight className="text-sm" />
            </a>
          </div>
        </div>

        {/* Layer 2: Parallax Image Cards Columns */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-2 gap-10 md:gap-32 relative z-20 pointer-events-none">
          {/* Left Column (scrubs UP) */}
          <div
            ref={colLeftRef}
            className="flex flex-col gap-20 md:gap-40 items-start pointer-events-auto"
          >
            {explorations.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item.image)}
                className={`w-full aspect-square max-w-[280px] md:max-w-[340px] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-zoom-in relative group shadow-2xl transition duration-500 hover:scale-[1.03] ${item.rotation}`}
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition duration-700"
                />
                <div className="absolute inset-0 bg-neutral-950/20 opacity-100 group-hover:opacity-0 transition duration-500" />
              </div>
            ))}
          </div>

          {/* Right Column (scrubs DOWN) */}
          <div
            ref={colRightRef}
            className="flex flex-col gap-20 md:gap-40 items-end justify-center pointer-events-auto"
          >
            {explorations.slice(3, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item.image)}
                className={`w-full aspect-square max-w-[280px] md:max-w-[340px] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-zoom-in relative group shadow-2xl transition duration-500 hover:scale-[1.03] ${item.rotation}`}
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition duration-700"
                />
                <div className="absolute inset-0 bg-neutral-950/20 opacity-100 group-hover:opacity-0 transition duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#0a0a0a] py-24 md:py-32 relative border-t border-neutral-900/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
            <div className="space-y-2">
              <span className="text-5xl md:text-7xl font-display text-neutral-100 block">20+</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">
                Years Experience
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-5xl md:text-7xl font-display text-neutral-100 block">95+</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">
                Projects Done
              </span>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-display text-neutral-100 block accent-gradient-text">200%</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">
                Satisfied Clients
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Widget */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl"
            >
              <img src={lightboxImage} alt="Exploration render preview" className="max-w-full max-h-[80vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Contact Section */}
      <section
        id="contact"
        className="w-full relative bg-[#090909] pt-24 pb-12 overflow-hidden border-t border-neutral-900/50"
      >
        {/* Background HLS Video (Flipped vertically) */}
        <div className="absolute inset-0 w-full h-full -z-20 select-none pointer-events-none">
          <video
            ref={footerVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-20 filter grayscale scale-y-[-1]"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col items-center">
          {/* GSAP Scrolling Marquee */}
          <div className="w-screen overflow-hidden py-10 border-y border-neutral-900/30 mb-20">
            <div ref={marqueeRef} className="flex whitespace-nowrap text-6xl md:text-8xl font-display uppercase italic text-neutral-800/40 select-none">
              {Array(10)
                .fill("BUILDING THE FUTURE • ")
                .map((text, idx) => (
                  <span key={idx} className="mr-8">
                    {text}
                  </span>
                ))}
            </div>
          </div>

          {/* Email Call-To-Action */}
          <div className="text-center max-w-xl flex flex-col items-center gap-6 mb-24">
            <span className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold block">
              WANT TO COLLABORATE?
            </span>
            <h2 className="text-4xl md:text-6xl font-display text-neutral-200 leading-tight">
              Let's create something <span className="italic text-neutral-400">extraordinary</span>
            </h2>
            <a
              href="mailto:hello@michaelsmith.com"
              className="mt-4 relative group inline-flex items-center justify-center text-sm font-bold uppercase tracking-wider rounded-full py-4 px-10 transition hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-[-1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span className="absolute inset-0 bg-[#f5f5f5] rounded-full -z-10" />
              <span className="text-[#0a0a0a] font-bold">hello@michaelsmith.com</span>
            </a>
          </div>

          {/* Footer Bar */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center border-t border-neutral-900/40 pt-10 gap-6">
            {/* Left Status */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                Available for projects
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              {["Twitter", "LinkedIn", "Dribbble", "GitHub"].map((platform) => (
                <a
                  key={platform}
                  href={`https://${platform.toLowerCase()}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-200 transition font-bold uppercase tracking-wider"
                >
                  {platform}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-[10px] text-neutral-600 font-body">
              © 2026 Michael Smith. All rights reserved.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
