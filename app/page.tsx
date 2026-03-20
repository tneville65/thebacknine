"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ── Custom cursor ─────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.4 });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}

// ── Parallax clouds ───────────────────────────────────────────────────────────
function Cloud({ x, y, scale, opacity }: { x: string; y: string; scale: number; opacity: number }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, transform: `scale(${scale})`, opacity }}>
      <div className="relative">
        <div className="w-24 h-10 bg-white rounded-full opacity-90" />
        <div className="absolute -top-4 left-6 w-16 h-12 bg-white rounded-full opacity-90" />
        <div className="absolute -top-2 left-14 w-12 h-8 bg-white rounded-full opacity-85" />
      </div>
    </div>
  );
}

// ── Ball arc animation ────────────────────────────────────────────────────────
function BallArc() {
  const ref = useRef<SVGSVGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball || !sectionRef.current) return;
    gsap.set(ball, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
        end: "bottom 40%",
        scrub: 1,
      },
    });

    tl.to(ball, { opacity: 1, duration: 0.1 }, 0)
      .to(ball, {
        motionPath: {
          path: "#ball-path",
          align: "#ball-path",
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: 1,
        ease: "power1.inOut",
      }, 0)
      .to(ball, { opacity: 0, duration: 0.1 }, 0.9);
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg ref={ref} className="absolute inset-0 w-full h-full">
        <path
          id="ball-path"
          d="M 15% 85% Q 50% 5% 85% 75%"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle ref={ballRef} r="8" fill="white" opacity="0">
          <animate attributeName="r" values="8;9;8" dur="0.3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ── Calculator ────────────────────────────────────────────────────────────────
function Calculator() {
  const [annual, setAnnual] = useState(250000);

  // Formulas based on $250K baseline
  const ratio = annual / 250000;
  const option1 = Math.round(727819 * ratio);
  const option2 = Math.round(1318516 * ratio);
  const gap = option2 - option1;
  const lifetime = Math.round(option2 * 49); // age 51-100 = 49 years

  const fmt = (n: number) => "$" + n.toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Your Annual Contribution</p>
      <div className="flex items-center gap-4 mb-2">
        <span className="font-serif text-4xl font-bold text-gray-900">{fmt(annual)}</span>
        <span className="text-gray-400 text-sm">/ year</span>
      </div>
      <input
        type="range"
        min={50000}
        max={1000000}
        step={10000}
        value={annual}
        onChange={e => setAnnual(Number(e.target.value))}
        className="w-full mb-8"
      />

      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Option 1 */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-1">
            <span className="text-gray-500 text-sm">Option 1 — Overfunded Life Insurance</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Tax-Free</span>
          </div>
          <div className="font-serif text-3xl font-bold text-gray-900 mt-2">{fmt(option1)}</div>
          <div className="text-gray-400 text-xs mt-1">per year · age 51 to 100</div>
        </div>

        {/* Option 2 */}
        <div className="border-2 border-[#c0392b] rounded-xl p-6 bg-[#c0392b]/4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#c0392b] text-white text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold rounded-bl-lg">Premium Financing</div>
          <div className="flex justify-between items-start mb-1">
            <span className="text-gray-600 text-sm font-medium">Option 2 — Premium Financing</span>
            <span className="text-xs bg-[#c0392b]/10 text-[#c0392b] px-2 py-1 rounded">Tax-Free</span>
          </div>
          <div className="font-serif text-4xl font-bold text-[#c0392b] mt-2">{fmt(option2)}</div>
          <div className="text-gray-500 text-xs mt-1">per year · age 51 to 100</div>
        </div>
      </div>

      {/* Gap */}
      <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">The difference</p>
        <p className="font-serif text-2xl font-bold text-gray-900">
          {fmt(gap)} <span className="text-gray-400 font-normal text-lg">more / year</span>
        </p>
        <p className="text-gray-400 text-sm mt-1">
          {fmt(lifetime)} additional over your lifetime · 100% tax-free
        </p>
      </div>

      <a
        href="mailto:paul@keyarx.com?subject=The Back Nine — Let's Talk"
        className="block w-full text-center bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all duration-200 hover:shadow-lg"
      >
        Talk to KeyArx
      </a>
    </div>
  );
}

// ── Fade up section ───────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Page() {
  const containerRef = useRef(null);
  const skyRef = useRef<HTMLDivElement>(null);

  // Parallax clouds
  const { scrollYProgress: skyScroll } = useScroll({ target: skyRef, offset: ["start end", "end start"] });
  const cloud1X = useTransform(skyScroll, [0, 1], ["-5%", "5%"]);
  const cloud2X = useTransform(skyScroll, [0, 1], ["3%", "-3%"]);
  const cloud3X = useTransform(skyScroll, [0, 1], ["-2%", "4%"]);

  return (
    <div ref={containerRef} className="overflow-x-hidden">
      <Cursor />

      {/* ══ ACT 1: THE FAIRWAY (HERO) ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-24">
        {/* Sky */}
        <div className="absolute inset-0 sky-bg" />

        {/* Sun glow */}
        <div className="absolute top-16 right-24 w-32 h-32 rounded-full bg-yellow-100 opacity-60 blur-2xl" />
        <div className="absolute top-20 right-28 w-16 h-16 rounded-full bg-yellow-200 opacity-80 blur-sm" />

        {/* Static clouds */}
        <Cloud x="5%" y="8%" scale={1.2} opacity={0.9} />
        <Cloud x="60%" y="5%" scale={0.8} opacity={0.7} />
        <Cloud x="80%" y="12%" scale={1.0} opacity={0.8} />
        <Cloud x="35%" y="3%" scale={0.6} opacity={0.6} />

        {/* Fairway layers - parallax */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3">
          {/* Deep background trees */}
          <div className="absolute bottom-1/2 left-0 right-0 h-20"
            style={{ background: "linear-gradient(180deg, transparent, rgba(30,80,25,0.4))" }} />
          {/* Mid fairway */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 fairway-bg" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
          {/* Fairway highlight */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1/2 opacity-30"
            style={{ background: "linear-gradient(0deg, rgba(100,180,80,0.8), transparent)" }} />
        </div>

        {/* Flag */}
        <div className="absolute bottom-32 right-1/3 flex flex-col items-center">
          <div className="w-px h-20 bg-gray-800" />
          <div className="absolute top-0 left-0 w-8 h-5 bg-[#c0392b]" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
        </div>

        {/* Hero text */}
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-green-900/60 text-xs uppercase tracking-[0.5em] mb-6"
          >
            The KeyArx Group
          </motion.p>

          <div className="overflow-hidden mb-3">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-green-900 leading-tight"
            >
              The front nine
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-green-900/50 leading-tight italic"
            >
              is your career.
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <a
              href="#tee"
              className="inline-block bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-12 py-4 uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(192,57,43,0.4)]"
            >
              See the Back Nine →
            </a>
          </motion.div>
        </div>

        {/* Scroll arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-green-800/40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ ACT 2: ADDRESS (ball on tee) ═══════════════════════════════════════ */}
      <section id="tee" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Lighter fairway, close up */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #5a9e50 0%, #4a8a42 100%)" }} />

        {/* Rough texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 8px)", backgroundSize: "8px 100%" }} />

        {/* Tee + ball visual */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-1"
          />
          <div className="w-1 h-6 bg-white/60 rounded-full" />
          <div className="w-8 h-1 bg-green-300/40 rounded-full mt-0.5" />
        </div>

        <div className="relative z-10 text-center px-8 max-w-3xl">
          <FadeUp>
            <p className="text-white/50 text-xs uppercase tracking-[0.5em] mb-8">The setup</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
              Most athletes walk off the course not knowing what they left behind.
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl mx-auto mb-12">
              It's not about what you made. It's about the structure you used — or didn't use.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <a
              href="#sky"
              className="inline-block border-2 border-white text-white hover:bg-white hover:text-green-800 font-bold px-12 py-4 uppercase tracking-widest text-sm transition-all duration-300"
            >
              Step up to the tee
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ══ ACT 3: THE SKY (ball in the air) ══════════════════════════════════ */}
      <section id="sky" ref={skyRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #4A90D9 0%, #7BB8E8 35%, #A8D4F0 65%, #C8E8C0 100%)" }} />

        {/* Animated clouds */}
        <motion.div style={{ x: cloud1X }} className="absolute top-[8%] left-[5%]">
          <Cloud x="0" y="0" scale={1.4} opacity={0.85} />
        </motion.div>
        <motion.div style={{ x: cloud2X }} className="absolute top-[15%] right-[10%]">
          <Cloud x="0" y="0" scale={1.0} opacity={0.75} />
        </motion.div>
        <motion.div style={{ x: cloud3X }} className="absolute top-[6%] left-[45%]">
          <Cloud x="0" y="0" scale={0.7} opacity={0.65} />
        </motion.div>
        <motion.div style={{ x: cloud1X }} className="absolute top-[25%] left-[20%]">
          <Cloud x="0" y="0" scale={0.9} opacity={0.5} />
        </motion.div>

        {/* Ball arc */}
        <BallArc />

        {/* THE money question */}
        <div className="relative z-10 text-center px-8 max-w-4xl">
          <FadeUp>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
              Over the course of your life, would an extra{" "}
              <span className="text-[#c0392b] drop-shadow-none" style={{ textShadow: "0 2px 20px rgba(192,57,43,0.3)" }}>
                $30 million
              </span>{" "}
              mean something to you?
            </h2>
          </FadeUp>
          <FadeUp delay={0.3} className="mt-12">
            <a
              href="#calculator"
              className="inline-block bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-14 py-5 uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgba(192,57,43,0.5)] text-lg"
            >
              Run My Numbers →
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ══ ACT 4: LANDING (back nine + calculator) ════════════════════════════ */}
      <section id="calculator" className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(180deg, #C8E8C0 0%, #f5f0e8 15%)" }}>
        {/* Back nine flag */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30">
          <div className="w-px h-16 bg-gray-600" />
          <div className="absolute top-0 left-0 w-6 h-4 bg-[#c0392b]" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
          <div className="mt-1 text-xs text-gray-500 uppercase tracking-widest font-medium">Hole 10</div>
        </div>

        <div className="max-w-3xl mx-auto px-8 pt-16">
          <FadeUp className="text-center mb-16">
            <p className="text-gray-400 text-xs uppercase tracking-[0.5em] mb-6">The back nine</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Same investment.<br />
              <span className="text-[#c0392b]">Wildly different structure.</span>
            </h2>
            <p className="text-gray-500 mt-6 text-lg">Adjust the number. See what changes.</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Calculator />
          </FadeUp>
        </div>
      </section>

      {/* ══ ACT 5: THE CLUBHOUSE (CTA) ════════════════════════════════════════ */}
      <section className="py-32 bg-[#f5f0e8] relative overflow-hidden">
        {/* Subtle course lines */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(0,0,0,0.3) 60px, rgba(0,0,0,0.3) 61px)" }} />

        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          <FadeUp>
            <div className="inline-block mb-8 opacity-30">
              <div className="flex items-center gap-2">
                <div className="w-px h-12 bg-gray-600" />
                <div className="w-5 h-3.5 bg-[#c0392b]" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">The 19th hole</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-8">
              Ready to talk about<br />
              <span className="text-[#c0392b] italic">the back nine?</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-gray-500 text-xl leading-relaxed max-w-xl mx-auto mb-12">
              No pitch. No pressure. Just a straight conversation about what your money could actually be doing — with a structure built for your career window.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <a
              href="mailto:paul@keyarx.com?subject=The Back Nine — Let's Talk"
              className="inline-block bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-16 py-5 uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgba(192,57,43,0.4)]"
            >
              Start the Conversation
            </a>
          </FadeUp>

          <FadeUp delay={0.4} className="mt-16 pt-12 border-t border-gray-200">
            <p className="text-gray-400 text-sm">
              <span className="font-medium text-gray-600">The KeyArx Group</span> · Paul Cella, CLU, ChFC<br />
              paul@keyarx.com · (732) 983-9830
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
