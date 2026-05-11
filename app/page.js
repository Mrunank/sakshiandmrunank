"use client";

import React, { useEffect, useState, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ENGAGEMENT_DATE = new Date("2026-07-04T11:00:00");
const WEDDING_DATE    = new Date("2026-12-28T10:00:00");

// Desktop door image border cover sizes (px) — tune these to hide gold flourishes
const COVER_SIDE   = 495;  // outer left/right strip width
const COVER_TOP    = 100;  // top strip height
const COVER_BOTTOM = 70;   // bottom strip height

// Font families — applied inline where needed
const FONT_DISPLAY = "'Cormorant Garamond', serif";  // hero names, door title, countdown numbers
const FONT_SECTION = "'Playfair Display', serif";    // section headings
const FONT_AMPERSAND = "'IM Fell English', serif";   // the "&" connector
const FONT_BODY    = "'Lato', sans-serif";           // descriptions, labels, body text

// Nav links
const NAV_LINKS = [
  { label: "Home",         id: "home"    },
  { label: "Our Story",    id: "story"   },
  { label: "Event Details",id: "events"  },
  { label: "Photos",       id: "gallery" },
  { label: "RSVP",         id: "rsvp"   },
];

// Event cards data
const EVENTS = [
  {
    title: "Engagement Ceremony",
    date: "July 4, 2026",
    time: "11:00 AM",
    desc: "An afternoon of celebration, rings, family, and joy.",
    locationLabel: "Nagpur • Hotel Eternia",
    locationLink: "https://maps.app.goo.gl/fy8dFXoMSSkpe4HA9",
  },
  {
    title: "Mehendi",
    date: "Coming Soon",
    time: "",
    desc: "Hands painted green, laughter, and slow unfolding stories.",
    locationLabel: "",
    locationLink: "",
  },
  {
    title: "Haldi",
    date: "Coming Soon",
    time: "",
    desc: "Turmeric chaos, teasing smiles, and warm family blessings.",
    locationLabel: "",
    locationLink: "",
  },
  {
    title: "Sangeet",
    date: "Coming Soon",
    time: "",
    desc: "Lights, dance battles, loud music, unstoppable collective joy.",
    locationLabel: "",
    locationLink: "",
  },
  {
    title: "Wedding Ceremony",
    date: "December 28, 2026",
    time: "10:00 AM",
    desc: "The beginning of forever with blessings from everyone we love.",
    locationLabel: "Indore",
    locationLink: "https://maps.app.goo.gl/vTZq7vUkBEQNeBFq8",
  },
  {
    title: "Reception",
    date: "December 30, 2026",
    time: "7:30 PM",
    desc: "A night of music, dancing, memories, and celebration.",
    locationLabel: "Nagpur",
    locationLink: "https://maps.app.goo.gl/u2eDZdSCvkkyrTU77",
  },
];


// ─── HOOKS ────────────────────────────────────────────────────────────────────

// Counts down to a target date, updating every second
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) return;
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
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

// Watches which section is visible and returns its id
function useActiveSection() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id], div[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -50% 0px" }
    );
    sections.forEach((s) => { if (s.id) observer.observe(s); });
    return () => observer.disconnect();
  }, []);

  return activeSection;
}


// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// Single countdown unit (Days / Hours / Minutes / Seconds)
function CountdownCard({ label, value }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-[#e5cbb6] rounded-3xl px-4 sm:px-6 py-6 sm:py-8 shadow-xl min-w-[130px] text-center">
      <div
        className="text-4xl sm:text-5xl md:text-6xl font-light text-[#5b2333] mb-2 tracking-tight"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        className="uppercase tracking-[0.35em] text-xs text-[#9c6e5f]"
        style={{ fontFamily: FONT_BODY }}
      >
        {label}
      </div>
    </div>
  );
}

// Reusable page section wrapper with icon, title, and divider
function Section({ icon, title, children }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <div className="flex items-center gap-3 justify-center mb-5">
        {icon && <span className="text-3xl">{icon}</span>}
        <h2
          className="text-4xl md:text-5xl text-[#5b2333] font-light tracking-tight"
          style={{ fontFamily: FONT_SECTION }}
        >
          {title}
        </h2>
      </div>
      <div className="w-28 h-[1px] bg-[#d7b49e] mx-auto mb-12" />
      {children}
    </section>
  );
}


// ─── DOOR INTRO ───────────────────────────────────────────────────────────────

// Full-screen animated door overlay shown before the main page.
// Scroll/swipe opens the doors. Once fully open, waits 1s then calls onUnlocked.
function DoorIntro({ onUnlocked }) {
  const [progress, setProgress] = useState(0); // 0 = closed, 1 = fully open
  const [done, setDone]         = useState(false);
  const progressRef = useRef(0);  // ref copy for use inside event handlers (avoids stale closures)
  const doneRef     = useRef(false);
  const touchStartY = useRef(0);  // tracks swipe start position

  // Moves the doors open by a delta amount (0–1 scale)
  const advance = (delta) => {
    if (doneRef.current) return;
    const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
    progressRef.current = next;
    setProgress(next);
    if (next >= 1) {
      doneRef.current = true;
      setDone(true);
    }
  };

  // Attach scroll/key/touch listeners while doors are still opening.
  // When done flips to true, the cleanup function removes all listeners automatically.
  useEffect(() => {
    if (done) return;

    const onWheel = (e) => {
      e.preventDefault();                    // stop page scrolling behind overlay
      advance(e.deltaY * 0.0015);            // desktop scroll sensitivity
    };

    const onKey = (e) => {
      if (e.key === "ArrowDown") advance(0.05);
    };

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.preventDefault();                    // stop page scrolling behind overlay on mobile
      const delta = (touchStartY.current - e.touches[0].clientY) * 0.004; // mobile swipe sensitivity
      advance(delta);
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      touchStartY.current = 0;              // clear on lift so momentum doesn't leak into page
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });
    window.addEventListener("touchend",   onTouchEnd);

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [done]);

  // Once doors finish opening, wait 1s for scroll momentum to flush, then unlock
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onUnlocked, 1000);
    return () => clearTimeout(timer);
  }, [done]);

  // Remove overlay from DOM once fully open
  if (done && progress >= 1) return null;

  // Coloured rectangles that cover the decorative gold border in the door images (desktop only)
  const BorderCovers = ({ side }) => (
    <>
      {/* Outer vertical strip — covers the full-height side border */}
      <div
        className="absolute top-0 h-full hidden md:block"
        style={{ [side]: 0, width: COVER_SIDE, backgroundColor: "#F5F2E8" }}
      />
      {/* Top strip — covers top corner flourish */}
      <div
        className="absolute hidden md:block"
        style={{ [side]: 0, top: 0, width: "700px", height: COVER_TOP, backgroundColor: "#F5F2E8" }}
      />
      {/* Bottom strip — covers bottom corner flourish */}
      <div
        className="absolute hidden md:block"
        style={{ [side]: 0, bottom: 0, width: "100%", height: COVER_BOTTOM, backgroundColor: "#F5F2E8" }}
      />
    </>
  );

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto">

      {/* ── LEFT DOOR — slides out to the left as progress increases ── */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 overflow-hidden"
        style={{
          transform: `translateX(-${progress * 100}%)`,
          willChange: "transform",
          backgroundColor: "#F5F2E8", // fills dead space beside image on desktop
        }}
      >
        {/* Mobile: image covers full container */}
        <div
          className="absolute inset-0 block md:hidden"
          style={{
            backgroundImage: "url('/door-left.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Desktop: full height, anchored to center seam, border covered */}
        <div className="absolute hidden md:block h-full w-full">
          <img
            src="/door-left.jpg" alt="" draggable={false}
            className="h-full w-full"
            style={{ objectFit: "contain", objectPosition: "right center" }}
          />
          <BorderCovers side="left" />
        </div>
      </div>

      {/* ── RIGHT DOOR — slides out to the right as progress increases ── */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 overflow-hidden"
        style={{
          transform: `translateX(${progress * 100}%)`,
          willChange: "transform",
          backgroundColor: "#F5F2E8",
        }}
      >
        {/* Mobile: image covers full container */}
        <div
          className="absolute inset-0 block md:hidden"
          style={{
            backgroundImage: "url('/door-right.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Desktop: full height, anchored to center seam, border covered */}
        <div className="absolute hidden md:block h-full w-full">
          <img
            src="/door-right.jpg" alt="" draggable={false}
            className="h-full w-full"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
          <BorderCovers side="right" />
        </div>
      </div>

      {/* ── CENTER SEAM — thin line between doors, fades as they open ── */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-white/20 pointer-events-none"
        style={{ opacity: 1 - progress }}
      />

      {/* ── TEXT OVERLAY — fades out in the first half of the scroll ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{ opacity: 1 - progress * 2 }}
      >
        <p
          className="text-[#800020] uppercase tracking-[0.5em] text-xs sm:text-sm mb-4 font-bold"
          style={{
            fontFamily: FONT_BODY,
            textShadow: "0 2px 8px rgba(74,29,43,0.8), 0 4px 20px rgba(74,29,43,0.6)",
          }}
        >
          Welcome To
        </p>
        <h1
          className="text-[#F5F2E8] text-5xl sm:text-7xl md:text-8xl font-light tracking-tight mb-6"
          style={{
            fontFamily: FONT_DISPLAY,
            textShadow: "0 2px 12px rgba(74,29,43,0.9), 0 4px 30px rgba(74,29,43,0.7)",
          }}
        >
          Sakshi & Mrunank
        </h1>
        <p
          className="text-[#800020] text-sm sm:text-lg tracking-[0.3em] uppercase font-bold"
          style={{
            fontFamily: FONT_BODY,
            textShadow: "0 2px 8px rgba(74,29,43,0.8), 0 4px 20px rgba(74,29,43,0.6)",
          }}
        >
          Scroll To Open The Gates
        </p>
        <div
          className="mt-8 animate-bounce text-[#F5F2E8] text-3xl"
          style={{ textShadow: "0 2px 8px rgba(74,29,43,0.8)" }}
        >
          ↓
        </div>
      </div>

    </div>
  );
}


// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WeddingWebsite() {
  const [unlocked, setUnlocked] = useState(false); // false = overlay active, true = page scrollable
  const activeSection  = useActiveSection();
  const engagementTime = useCountdown(ENGAGEMENT_DATE);
  const weddingTime    = useCountdown(WEDDING_DATE);

  // Lock body scroll while door overlay is active
  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [unlocked]);

  return (
    <div className="bg-[#f8f2eb] text-[#4a1d2b] min-h-screen scroll-smooth" style={{ fontFamily: FONT_BODY }}>

      {/* Door overlay — unmounts once unlocked */}
      {!unlocked && <DoorIntro onUnlocked={() => setUnlocked(true)} />}

      {/* Soft ambient background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-pink-200 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] rounded-full bg-yellow-100 opacity-20 blur-3xl" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 pt-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/55 backdrop-blur-2xl border border-[#e7d3c1] shadow-xl rounded-full px-3 sm:px-5 py-3">
            <div className="flex items-center justify-center gap-1 sm:gap-4 flex-nowrap overflow-x-auto">
              {NAV_LINKS.map(({ label, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`px-2 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-base tracking-wide transition-all duration-300 whitespace-nowrap ${
                    activeSection === id
                      ? "bg-[#5b2333] text-white shadow-lg"
                      : "text-[#5b2333] hover:bg-[#5b2333] hover:text-white"
                  }`}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="h-screen flex items-center justify-center px-4 sm:px-6 scroll-mt-32">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-16">

          {/* Left: names, dates, location */}
          <div className="text-center lg:text-left order-2 lg:order-1 px-1">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 border border-[#e7d3c1] text-[#9c6e5f] tracking-[0.3em] uppercase text-xs mb-8 shadow-md"
              style={{ fontFamily: FONT_BODY }}
            >
              <span>✨</span> Our Forever Begins
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-light leading-tight mb-6 tracking-tight text-[#5b2333]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Sakshi
              <span
                className="block text-[#9c6e5f] text-4xl md:text-5xl my-3"
                style={{ fontFamily: FONT_AMPERSAND }}
              >
                &
              </span>
              Mrunank
            </h1>

            <p
              className="text-base sm:text-xl md:text-2xl leading-relaxed text-[#6e4653] max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10"
              style={{ fontFamily: FONT_BODY }}
            >
              Join us as we celebrate the beginning of a beautiful journey filled with love, laughter, traditions, and forever.
            </p>

            <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-row lg:flex-wrap lg:gap-4 justify-center lg:justify-start">
             {[
  { icon: "📅", label: "Engagement", value: "July 4, 2026", width: "220px" },
  { icon: "📍", label: "Engagement Location", value: "Nagpur, India", width: "260px" },
  { icon: "💍", label: "Wedding", value: "December 28, 2026", width: "220px" },
  { icon: "📍", label: "Wedding Location", value: "Indore, India", width: "260px" },
].map(({ icon, label, value, width }) => (
  <div key={label} className="flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-xl border border-[#e7d3c1] px-3 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-lg w-full lg:w-auto" style={{ maxWidth: width }}>
    <span className="text-xl">{icon}</span>
    <div>
      <div className="text-sm uppercase tracking-widest text-[#9c6e5f]" style={{ fontFamily: FONT_BODY }}>{label}</div>
      <div className="text-lg" style={{ fontFamily: FONT_BODY }}>{value}</div>
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

      {/* ── COUNTDOWNS ── */}
      <Section icon="💖" title="Countdowns">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* Engagement countdown */}
          <div className="bg-white/40 backdrop-blur-xl border border-[#e7d3c1] rounded-[36px] p-6 sm:p-8 shadow-xl text-center">
            <p className="uppercase tracking-[0.35em] text-sm text-[#9c6e5f] mb-3" style={{ fontFamily: FONT_BODY }}>Engagement</p>
            <p className="text-[#5b2333] text-2xl sm:text-3xl mb-8 font-light" style={{ fontFamily: FONT_DISPLAY }}>July 4, 2026</p>
            <div className="grid grid-cols-2 gap-4">
              <CountdownCard label="Days"    value={engagementTime.days}    />
              <CountdownCard label="Hours"   value={engagementTime.hours}   />
              <CountdownCard label="Minutes" value={engagementTime.minutes} />
              <CountdownCard label="Seconds" value={engagementTime.seconds} />
            </div>
          </div>

          {/* Wedding countdown */}
          <div className="bg-white/40 backdrop-blur-xl border border-[#e7d3c1] rounded-[36px] p-6 sm:p-8 shadow-xl text-center">
            <p className="uppercase tracking-[0.35em] text-sm text-[#9c6e5f] mb-3" style={{ fontFamily: FONT_BODY }}>Wedding</p>
            <p className="text-[#5b2333] text-2xl sm:text-3xl mb-8 font-light" style={{ fontFamily: FONT_DISPLAY }}>December 28, 2026</p>
            <div className="grid grid-cols-2 gap-4">
              <CountdownCard label="Days"    value={weddingTime.days}    />
              <CountdownCard label="Hours"   value={weddingTime.hours}   />
              <CountdownCard label="Minutes" value={weddingTime.minutes} />
              <CountdownCard label="Seconds" value={weddingTime.seconds} />
            </div>
          </div>

        </div>
      </Section>

      {/* ── OUR STORY ── */}
      <div id="story" className="scroll-mt-32">
        <Section icon="💞" title="Our Story">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl leading-relaxed text-[#6a4754]" style={{ fontFamily: FONT_DISPLAY }}>
              Two people. Two journeys. One beautiful destiny.
            </p>
            <p className="mt-8 text-lg leading-9 text-[#6a4754]" style={{ fontFamily: FONT_BODY }}>
              What started as a connection slowly became a partnership built on trust, laughter, ambition, and unwavering support. Together, we now begin a new chapter — surrounded by our families, traditions, and the people we love most.
            </p>
          </div>
        </Section>
      </div>

      {/* ── EVENT DETAILS ── */}
      <div id="events" className="scroll-mt-32">
        <Section icon="🗓️" title="Event Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {EVENTS.map(({ title, date, time, desc, locationLabel, locationLink }) => (
              <div key={title} className="bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-3xl p-6 sm:p-8 shadow-xl hover:-translate-y-1 transition-transform">
                <h3 className="text-2xl mb-3 text-[#5b2333]" style={{ fontFamily: FONT_SECTION }}>{title}</h3>
                <p className="uppercase tracking-[0.25em] text-xs text-[#9c6e5f] mb-3" style={{ fontFamily: FONT_BODY }}>
                  {date}{time ? ` • ${time}` : ""}
                </p>
                <p className="leading-8 text-[#6a4754] mb-4" style={{ fontFamily: FONT_BODY }}>{desc}</p>
                {locationLink && (
                  <a
                    href={locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#5b2333] font-medium hover:underline"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    <span className="inline-block w-3 h-2 rounded-full bg-[#5b2333] opacity-80" />
                    {locationLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── GALLERY ── */}
      <div id="gallery" className="scroll-mt-32">
        <Section icon="📸" title="Gallery">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl sm:rounded-3xl bg-white/60 border border-[#e7d3c1] shadow-xl flex items-center justify-center text-[#9c6e5f] text-sm sm:text-lg" style={{ fontFamily: FONT_BODY }}>
                Photo {i}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── RSVP ── */}
      <div id="rsvp" className="scroll-mt-32">
        <Section icon="🎶" title="RSVP">
          <div className="max-w-2xl mx-auto bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-[28px] sm:rounded-[40px] p-5 sm:p-10 shadow-2xl">
            <div className="space-y-6" style={{ fontFamily: FONT_BODY }}>
  <input
    type="text"
    placeholder="Your Name *"
    required
    className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
  />
  <input
    type="email"
    placeholder="Email Address"
    className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
  />
  <select
    required
    className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none text-[#6a4754]"
  >
    <option value="">Will you attend? *</option>
    <option value="yes">Yes, absolutely!</option>
    <option value="no">Sadly, cannot make it</option>
  </select>
  <div className="px-1">
    <p className="text-sm uppercase tracking-widest text-[#9c6e5f] mb-3" style={{ fontFamily: FONT_BODY }}>
      Which events will you attend? *
    </p>
    <div className="space-y-3">
      {[
        { value: "engagement", label: "Engagement Ceremony", date: "July 4, 2026" },
       // { value: "mehendi",    label: "Mehendi",             date: "Coming Soon"  },
        //{ value: "haldi",      label: "Haldi",               date: "Coming Soon"  },
        //{ value: "sangeet",    label: "Sangeet",             date: "Coming Soon"  },
        //{ value: "wedding",    label: "Wedding Ceremony",    date: "December 28, 2026" },
        //{ value: "reception",  label: "Reception",           date: "December 30, 2026" },
      ].map(({ value, label, date }) => (
        <label
          key={value}
          className="flex items-center gap-3 bg-white/60 border border-[#e4cab7] px-4 py-3 rounded-2xl cursor-pointer hover:bg-white/80 transition-colors"
        >
          <input
            type="checkbox"
            value={value}
            className="accent-[#5b2333] w-4 h-4 cursor-pointer"
          />
          <div>
            <span className="text-[#4a1d2b] text-sm font-medium" style={{ fontFamily: FONT_BODY }}>{label}</span>
            <span className="text-[#9c6e5f] text-xs ml-2" style={{ fontFamily: FONT_BODY }}>— {date}</span>
          </div>
        </label>
      ))}
    </div>
  </div>
  <textarea
    rows={4}
    placeholder="Message for the couple"
    className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
  />
  <button
  onClick={async (e) => {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg6094HHmMRNiHBs92L9MDoEghddd689ddbMq2tccSlOXQhnabw43FFr3-OVOvkfvm/exec";

    const form    = e.currentTarget.closest("div");
    const name    = form.querySelector("input[type='text']").value;
    const email   = form.querySelector("input[type='email']").value;
    const attend  = form.querySelector("select").value;
    const checked = [...form.querySelectorAll("input[type='checkbox']:checked")].map(c => c.value);
    const message = form.querySelector("textarea").value;

    // Validation
    if (!name)                { alert("Please enter your name.");           return; }
    if (!attend)              { alert("Please select if you will attend."); return; }
    if (checked.length === 0) { alert("Please select at least one event."); return; }

    // Show loading state
    e.currentTarget.textContent = "Sending...";
    e.currentTarget.disabled = true;

    try {
      // Send as GET with URL params — bypasses CORS entirely
      const params = new URLSearchParams({
        name,
        email,
        attending: attend,
        events: checked.join(", "),
        message,
      });

      await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      });

      e.currentTarget.textContent = "RSVP Sent! 💖";
      e.currentTarget.style.backgroundColor = "#2d6a4f";

    } catch (err) {
      alert("Something went wrong. Please try again.");
      e.currentTarget.textContent = "Send RSVP";
      e.currentTarget.disabled = false;
    }
  }}
  className="w-full bg-[#5b2333] hover:bg-[#471926] transition-colors text-white py-4 rounded-2xl tracking-[0.25em] uppercase text-sm shadow-xl"
>
  Send RSVP
</button>
</div>
          </div>
        </Section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="py-14 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_#f5b6c5,_transparent_35%),radial-gradient(circle_at_bottom_right,_#f3d7a6,_transparent_35%)]" />
        <div className="relative z-10">
          <p className="text-4xl md:text-5xl font-light text-[#5b2333] mb-4" style={{ fontFamily: FONT_DISPLAY }}>
            Sakshi & Mrunank
          </p>
          <p className="uppercase tracking-[0.35em] text-sm text-[#9c6e5f] mb-8" style={{ fontFamily: FONT_BODY }}>
            December 28, 2026 • Indore
          </p>
          <div className="flex justify-center gap-3 text-[#9c6e5f] items-center" style={{ fontFamily: FONT_BODY }}>
            <span>💖</span><span>Forever Begins Here</span><span>💖</span>
          </div>
        </div>
      </footer>

    </div>
  );
}