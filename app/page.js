"use client";

import React, { useEffect, useState, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ENGAGEMENT_DATE = new Date("2026-07-04T11:00:00");

// Amount to cover the decorative gold border on desktop (px)
const DESKTOP_BORDER_COVER_SIDE = 495;   // left/right cover strip width
const DESKTOP_BORDER_COVER_TOP = 100;    // top cover strip height
const DESKTOP_BORDER_COVER_BOTTOM = 70; // bottom cover strip height


// ─── HOOKS ────────────────────────────────────────────────────────────────────

// Counts down to a target date, updating every second
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}


// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// Single countdown unit card (Days / Hours / Minutes / Seconds)
function CountdownCard({ label, value }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-[#e5cbb6] rounded-3xl px-4 sm:px-6 py-6 sm:py-8 shadow-xl min-w-[130px] text-center">
      <div className="text-4xl sm:text-5xl md:text-6xl font-light text-[#5b2333] mb-2 tracking-tight">
        {String(value).padStart(2, "0")}
      </div>
      <div className="uppercase tracking-[0.35em] text-xs text-[#9c6e5f]">{label}</div>
    </div>
  );
}

// Reusable page section with icon, title, divider, and children
function Section({ icon, title, children }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <div className="flex items-center gap-3 justify-center mb-5">
        {icon && <span className="text-3xl">{icon}</span>}
        <h2 className="text-4xl md:text-5xl text-[#5b2333] font-light tracking-tight">{title}</h2>
      </div>
      <div className="w-28 h-[1px] bg-[#d7b49e] mx-auto mb-12" />
      {children}
    </section>
  );
}


// ─── DOOR INTRO ───────────────────────────────────────────────────────────────

// Full-screen animated door overlay that plays before the main page is accessible.
// Scroll/swipe opens the doors. Once fully open, waits 1s then calls onUnlocked.
function DoorIntro({ onUnlocked }) {
  const [progress, setProgress] = useState(0);   // 0 = closed, 1 = fully open
  const [done, setDone] = useState(false);        // true when doors reach 100%
  const progressRef = useRef(0);                  // ref copy of progress for use inside event handlers
  const doneRef = useRef(false);                  // ref copy of done for use inside event handlers
  const touchStartY = useRef(0);                  // tracks touch start position for swipe delta

  // Advances the door open progress by a delta amount
  const advance = (delta) => {
    if (doneRef.current) return;
    const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
    progressRef.current = next;
    setProgress(next);

    if (next >= 1 && !doneRef.current) {
      doneRef.current = true;
      setDone(true);
    }
  };

  // Attach scroll/key/touch listeners while doors are still opening.
  // Automatically removed the moment doors finish (done = true).
  useEffect(() => {
    if (done) return;

    const onWheel = (e) => {
      e.preventDefault(); // prevents page from scrolling behind the overlay
      advance(e.deltaY * 0.0015); // desktop scroll sensitivity
    };

    const onKey = (e) => {
      if (e.key === "ArrowDown") advance(0.05);
    };

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.preventDefault(); // prevents page scroll behind overlay on mobile
      const delta = (touchStartY.current - e.touches[0].clientY) * 0.004; // mobile swipe sensitivity
      advance(delta);
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      touchStartY.current = 0; // reset on lift to prevent momentum leaking into page scroll
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [done]);

  // Once doors are fully open, wait 1s for scroll momentum to fully flush,
  // then fire onUnlocked to release the main page
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onUnlocked, 1000);
    return () => clearTimeout(timer);
  }, [done]);

  // Once done and fully open, remove the overlay entirely from the DOM
  if (done && progress >= 1) return null;

  // Cover strips that hide the decorative gold border in the door images (desktop only).
  // These are plain #F5F2E8 rectangles placed over the edges of the image.
  const BorderCovers = ({ side }) => (
  <>
    {/* Outer edge vertical strip — covers the full height of the border */}
    <div
      className="absolute top-0 h-full hidden md:block"
      style={{
        [side]: 0,
        width: DESKTOP_BORDER_COVER_SIDE,
        backgroundColor: "#F5F2E8",
      }}
    />
    {/* Top strip — covers the top corner flourish */}
    <div
      className="absolute hidden md:block"
      style={{
        [side]: 0,
        top: 0,
        width: "700px",
        height: DESKTOP_BORDER_COVER_TOP,
        backgroundColor: "#F5F2E8",
      }}
    />
    {/* Bottom strip — covers the bottom corner flourish */}
    <div
      className="absolute hidden md:block"
      style={{
        [side]: 0,
        bottom: 0,
        width: "100%",
        height: DESKTOP_BORDER_COVER_BOTTOM,
        backgroundColor: "#F5F2E8",
      }}
    />
  </>
);

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto">

      {/* ── LEFT DOOR ── */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 overflow-hidden"
        style={{
          transform: `translateX(-${progress * 100}%)`,
          willChange: "transform",
          backgroundColor: "#F5F2E8", // fallback for dead space beside image on desktop
        }}
      >
        {/* Mobile: cover fills container */}
        <div
          className="absolute inset-0 block md:hidden"
          style={{
            backgroundImage: "url('/door-left.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* Desktop: full height, anchored to center seam */}
        <div className="absolute hidden md:block h-full w-full">
          <img
            src="/door-left.jpg"
            alt=""
            draggable={false}
            className="h-full w-full"
            style={{ objectFit: "contain", objectPosition: "right center" }}
          />
          <BorderCovers side="left" />
        </div>
      </div>

      {/* ── RIGHT DOOR ── */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 overflow-hidden"
        style={{
          transform: `translateX(${progress * 100}%)`,
          willChange: "transform",
          backgroundColor: "#F5F2E8",
        }}
      >
        {/* Mobile: cover fills container */}
        <div
          className="absolute inset-0 block md:hidden"
          style={{
            backgroundImage: "url('/door-right.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />

        {/* Desktop: full height, anchored to center seam */}
        <div className="absolute hidden md:block h-full w-full">
          <img
            src="/door-right.jpg"
            alt=""
            draggable={false}
            className="h-full w-full"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
          <BorderCovers side="right" />
        </div>
      </div>

      {/* ── CENTER SEAM ── fades out as doors open */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-white/20 pointer-events-none"
        style={{ opacity: 1 - progress }}
      />

      {/* ── TEXT OVERLAY ── fades out in the first half of the scroll */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{ opacity: 1 - progress * 2 }}
      >
        <p className="text-[#800020] uppercase tracking-[0.5em] text-xs sm:text-sm mb-4">Welcome To</p>
        <h1 className="text-[#800020] text-5xl sm:text-7xl md:text-8xl font-light tracking-tight mb-6">
          Sakshi & Mrunank
        </h1>
        <p className="text-[#800020] text-sm sm:text-lg tracking-[0.3em] uppercase">Scroll To Open The Gates</p>
        <div className="mt-8 animate-bounce text-[#800020] text-3xl">↓</div>
      </div>

    </div>
  );
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WeddingWebsite() {
  const [unlocked, setUnlocked] = useState(false); // false = door overlay active, true = main page scrollable
  const timeLeft = useCountdown(ENGAGEMENT_DATE);

  // Lock body scroll while door overlay is active
  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [unlocked]);

  return (
    <div className="bg-[#f8f2eb] text-[#4a1d2b] min-h-screen">

      {/* Door overlay — removed from DOM once unlocked */}
      {!unlocked && <DoorIntro onUnlocked={() => setUnlocked(true)} />}

      {/* Ambient background blobs for soft depth */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-pink-200 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] rounded-full bg-yellow-100 opacity-20 blur-3xl" />
      </div>

      {/* ── HERO ── */}
      <section className="h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-16">

          {/* Left: names, dates, location */}
          <div className="text-center lg:text-left order-2 lg:order-1 px-1">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 border border-[#e7d3c1] text-[#9c6e5f] tracking-[0.3em] uppercase text-xs mb-8 shadow-md">
              <span>✨</span> Our Forever Begins
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-light leading-tight mb-6 tracking-tight text-[#5b2333]">
              Sakshi
              <span className="block text-[#9c6e5f] text-4xl md:text-5xl my-3 font-serif">&</span>
              Mrunank
            </h1>
            <p className="text-base sm:text-xl md:text-2xl leading-relaxed text-[#6e4653] max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10">
              Join us as we celebrate the beginning of a beautiful journey filled with love, laughter, traditions, and forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {[
                { icon: "📅", label: "Engagement", value: "July 4, 2026" },
                { icon: "📍", label: "Location", value: "Nagpur, India" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-[#e7d3c1] px-4 sm:px-5 py-4 rounded-2xl shadow-lg w-full sm:w-auto">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm uppercase tracking-widest text-[#9c6e5f]">{item.label}</div>
                    <div className="text-lg">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: wedding logo */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-yellow-100 blur-3xl opacity-40 scale-110 rounded-full" />
              <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#e4cab7] bg-white/50 backdrop-blur-xl shadow-2xl max-w-[320px] sm:max-w-[420px] lg:max-w-[520px]">
                <img src="logo.png" alt="Wedding Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <Section icon="💖" title="Countdown">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-5 text-center">
          <CountdownCard label="Days" value={timeLeft.days} />
          <CountdownCard label="Hours" value={timeLeft.hours} />
          <CountdownCard label="Minutes" value={timeLeft.minutes} />
          <CountdownCard label="Seconds" value={timeLeft.seconds} />
        </div>
      </Section>

      {/* ── OUR STORY ── */}
      <Section icon="💞" title="Our Story">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl leading-relaxed text-[#6a4754]">
            Two people. Two journeys. One beautiful destiny.
          </p>
          <p className="mt-8 text-lg leading-9 text-[#6a4754]">
            What started as a connection slowly became a partnership built on trust, laughter, ambition, and unwavering support. Together, we now begin a new chapter — surrounded by our families, traditions, and the people we love most.
          </p>
        </div>
      </Section>

      {/* ── EVENT DETAILS ── */}
      <Section icon="🗓️" title="Event Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {[
            { title: "Engagement Ceremony", date: "July 4, 2026", desc: "An evening of celebration, rings, family, and joy." },
            { title: "Wedding Ceremony", date: "December 28, 2026", desc: "The beginning of forever with blessings from everyone we love." },
            { title: "Reception", date: "Coming Soon", desc: "A night of music, dancing, memories, and celebration." },
          ].map((item) => (
            <div key={item.title} className="bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-3xl p-6 sm:p-8 shadow-xl hover:-translate-y-1 transition-transform">
              <h3 className="text-2xl mb-3 text-[#5b2333]">{item.title}</h3>
              <p className="uppercase tracking-[0.25em] text-xs text-[#9c6e5f] mb-5">{item.date}</p>
              <p className="leading-8 text-[#6a4754]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── GALLERY ── */}
      <Section icon="📸" title="Gallery">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-2xl sm:rounded-3xl bg-white/60 border border-[#e7d3c1] shadow-xl flex items-center justify-center text-[#9c6e5f] text-sm sm:text-lg">
              Photo {i}
            </div>
          ))}
        </div>
      </Section>

      {/* ── RSVP ── */}
      <Section icon="🎶" title="RSVP">
        <div className="max-w-2xl mx-auto bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-[28px] sm:rounded-[40px] p-5 sm:p-10 shadow-2xl">
          <div className="space-y-6">
            <input type="text" placeholder="Your Name" className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base" />
            <input type="email" placeholder="Email Address" className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base" />
            <select className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none text-[#6a4754]">
              <option>Will you attend?</option>
              <option>Yes, absolutely!</option>
              <option>Sadly, cannot make it</option>
            </select>
            <textarea rows={4} placeholder="Message for the couple" className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base" />
            <button className="w-full bg-[#5b2333] hover:bg-[#471926] transition-colors text-white py-4 rounded-2xl tracking-[0.25em] uppercase text-sm shadow-xl">
              Send RSVP
            </button>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="py-14 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_#f5b6c5,_transparent_35%),radial-gradient(circle_at_bottom_right,_#f3d7a6,_transparent_35%)]" />
        <div className="relative z-10">
          <p className="text-4xl md:text-5xl font-light text-[#5b2333] mb-4">Sakshi & Mrunank</p>
          <p className="uppercase tracking-[0.35em] text-sm text-[#9c6e5f] mb-8">July 4, 2026 • Nagpur</p>
          <div className="flex justify-center gap-3 text-[#9c6e5f] items-center">
            <span>💖</span><span>Forever Begins Here</span><span>💖</span>
          </div>
        </div>
      </footer>

    </div>
  );
}