"use client";

import React, { useEffect, useState, useRef } from "react";

const ENGAGEMENT_DATE = new Date("2026-07-04T11:00:00");

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

function DoorIntro({ onUnlocked }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const touchStartY = useRef(0);

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

  useEffect(() => {
    if (done) return; // removes all listeners the moment doors finish

    const onWheel = (e) => {
      e.preventDefault();
      advance(e.deltaY * 0.0015);
    };

    const onKey = (e) => {
      if (e.key === "ArrowDown") advance(0.05);
    };

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const delta = (touchStartY.current - e.touches[0].clientY) * 0.004;
      advance(delta);
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
    touchStartY.current = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [done]);

  // Once done, wait for the current scroll event to fully flush,
  // then unlock after a short pause so no momentum leaks through
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(onUnlocked, 1000);
    return () => clearTimeout(timer);
  }, [done]);

  if (done && progress >= 1) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto">
      {/* Left door */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 overflow-hidden"
        style={{ transform: `translateX(-${progress * 100}%)`, willChange: "transform" }}
      >
        <img src="/door-left.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      {/* Right door */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 overflow-hidden"
        style={{ transform: `translateX(${progress * 100}%)`, willChange: "transform" }}
      >
        <img src="/door-right.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>

      {/* Center seam */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-white/20 pointer-events-none"
        style={{ opacity: 1 - progress }}
      />

      {/* Text overlay */}
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

export default function WeddingWebsite() {
  const [unlocked, setUnlocked] = useState(false);
  const timeLeft = useCountdown(ENGAGEMENT_DATE);

  const handleUnlocked = () => {
    // Wait 2 frames before releasing scroll lock
    // This lets the browser discard queued scroll momentum
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUnlocked(true);
      });
    });
  };

  useEffect(() => {
    document.body.style.overflow = unlocked ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [unlocked]);

  return (
    <div className="bg-[#f8f2eb] text-[#4a1d2b] min-h-screen">
      {!unlocked && <DoorIntro onUnlocked={handleUnlocked} />}

      {/* Ambient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-pink-200 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] rounded-full bg-yellow-100 opacity-20 blur-3xl" />
      </div>

      {/* HERO */}
      <section className="h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-16">
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

      {/* COUNTDOWN */}
      <Section icon="💖" title="Countdown">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-5 text-center">
          <CountdownCard label="Days" value={timeLeft.days} />
          <CountdownCard label="Hours" value={timeLeft.hours} />
          <CountdownCard label="Minutes" value={timeLeft.minutes} />
          <CountdownCard label="Seconds" value={timeLeft.seconds} />
        </div>
      </Section>

      {/* OUR STORY */}
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

      {/* EVENT DETAILS */}
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

      {/* GALLERY */}
      <Section icon="📸" title="Gallery">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-2xl sm:rounded-3xl bg-white/60 border border-[#e7d3c1] shadow-xl flex items-center justify-center text-[#9c6e5f] text-sm sm:text-lg">
              Photo {i}
            </div>
          ))}
        </div>
      </Section>

      {/* RSVP */}
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

      {/* FOOTER */}
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