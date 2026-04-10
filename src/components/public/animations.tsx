"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

/* ═══════════════════════════════════════════
   FADE IN — scroll-triggered with spring physics
   ═══════════════════════════════════════════ */

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
  distance?: number;
  scale?: number;
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.8,
  distance = 60,
  scale = 1,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: `translateY(${distance}px) scale(${scale})`,
    down: `translateY(-${distance}px) scale(${scale})`,
    left: `translateX(${distance}px) scale(${scale})`,
    right: `translateX(-${distance}px) scale(${scale})`,
    none: `scale(${scale})`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: isVisible ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0px)" : "blur(8px)",
        transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity ${duration * 0.8}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TEXT REVEAL — letter-by-letter or word-by-word
   ═══════════════════════════════════════════ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: "word" | "letter";
}

export function TextReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  mode = "word",
}: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const items = mode === "word" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} className={className}>
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
          style={{ marginRight: mode === "word" ? "0.3em" : undefined }}
        >
          <span
            className="inline-block"
            style={{
              transform: isVisible ? "translateY(0) rotate(0deg)" : "translateY(110%) rotate(5deg)",
              opacity: isVisible ? 1 : 0,
              transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}s`,
              willChange: "transform, opacity",
            }}
          >
            {item}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════
   LINE REVEAL — horizontal line that draws itself
   ═══════════════════════════════════════════ */

interface LineRevealProps {
  className?: string;
  delay?: number;
  color?: string;
  height?: number;
}

export function LineReveal({
  className = "",
  delay = 0,
  color = "#1a6bb5",
  height = 2,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          height: `${height}px`,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          transform: isVisible ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   COUNT UP — animated number with easeOut
   ═══════════════════════════════════════════ */

interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function CountUp({ end, suffix = "", prefix = "", duration = 2.5 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   PARALLAX — scroll-linked transform
   ═══════════════════════════════════════════ */

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.3, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            setOffset((center - viewCenter) * speed * 0.15);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAGNETIC BUTTON — follows cursor on hover
   ═══════════════════════════════════════════ */

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      setPosition({ x, y });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "transform 0.15s ease-out",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FLOATING PARTICLES — ambient background effect
   ═══════════════════════════════════════════ */

export function FloatingParticles({ count = 30, color = "rgba(42,143,212,0.15)" }: { count?: number; color?: string }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      drift: (Math.random() - 0.5) * 30,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   GLOWING ORB — animated gradient sphere
   ═══════════════════════════════════════════ */

interface GlowingOrbProps {
  size?: number;
  color1?: string;
  color2?: string;
  className?: string;
  speed?: number;
}

export function GlowingOrb({
  size = 400,
  color1 = "#1a6bb5",
  color2 = "#2a8fd4",
  className = "",
  speed = 8,
}: GlowingOrbProps) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 40%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        animation: `orbFloat ${speed}s ease-in-out infinite`,
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   TILT CARD — 3D perspective tilt on hover
   ═══════════════════════════════════════════ */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export function TiltCard({ children, className = "", intensity = 10, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * intensity;
      const rotateY = (x - 0.5) * intensity;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlarePos({ x: x * 100, y: y * 100 });
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setHovering(false);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: hovering ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
      {glare && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            opacity: hovering ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MARQUEE — infinite horizontal scroll
   ═══════════════════════════════════════════ */

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

export function Marquee({ children, speed = 30, direction = "left", className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee${direction === "left" ? "" : "Reverse"} ${speed}s linear infinite`,
        }}
      >
        <div className="flex-shrink-0">{children}</div>
        <div className="flex-shrink-0">{children}</div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STAGGER GROUP — legacy export
   ═══════════════════════════════════════════ */

export function StaggerChildren({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
