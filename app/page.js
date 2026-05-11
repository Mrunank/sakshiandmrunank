"use client";

import React, { useEffect, useState } from 'react';

const engagementDate = new Date('2026-07-04T11:00:00');

function CountdownCard({ label, value }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl border border-[#e5cbb6] rounded-3xl px-4 sm:px-6 py-6 sm:py-8 shadow-xl min-w-[140px]">
      <div className="text-4xl sm:text-5xl md:text-6xl font-light text-[#5b2333] mb-2 tracking-tight">
        {String(value).padStart(2, '0')}
      </div>
      <div className="uppercase tracking-[0.35em] text-xs text-[#9c6e5f]">
        {label}
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 relative z-10">
      <div className="flex items-center gap-3 justify-center mb-5">
        {icon}
        <h2 className="text-4xl md:text-5xl text-[#5b2333] font-light tracking-tight">
          {title}
        </h2>
      </div>
      <div className="w-28 h-[1px] bg-[#d7b49e] mx-auto mb-12"></div>
      {children}
    </section>
  );
}

export default function WeddingWebsite() {
  const [openProgress, setOpenProgress] = useState(0);
  const [phase, setPhase] = useState('doors');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const touchStartY = React.useRef(0);

  const phaseRef = React.useRef('doors');

useEffect(() => {
  phaseRef.current = phase;
}, [phase]);

useEffect(() => {

  // ✅ ADD THIS HERE (LOCK SCROLL INITIALLY)
  document.documentElement.style.overflow = 'hidden';
document.documentElement.style.height = '100%';

document.body.style.overflow = 'hidden';
document.body.style.height = '100%';

  let progress = 0;

  const update = (delta) => {
  if (phase !== 'doors') return;

  progress = Math.min(Math.max(progress + delta, 0), 1);
  setOpenProgress(progress);

  // WHEN DOORS FINISH OPENING → enter buffer phase
  if (progress >= 1) {
    setPhase('buffer');

    // DO NOT unlock scroll yet
    // we pause interaction for a beat
  }
};

  const onWheel = (e) => {
  const currentPhase = phaseRef.current;

  if (currentPhase === 'doors') {
    e.preventDefault();
    update(e.deltaY * 0.0015);
    return;
  }

  if (currentPhase === 'buffer') {
    e.preventDefault();

    setPhase('unlocking');
    phaseRef.current = 'unlocking';
    window.scrollTo(0, 0);

    setTimeout(() => {
      setPhase('unlocked');
      phaseRef.current = 'unlocked';

      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    }, 500);

    return;
  }

  // unlocked → allow natural scroll (no preventDefault)
};

  const onKeyDown = (e) => {
  if (phase === 'doors' && e.key === 'ArrowDown') {
    update(0.05);
  }

  if (phase === 'buffer' && e.key === 'ArrowDown') {
    setPhase('unlocked');
    document.body.style.overflow = 'auto';
  }
};

const onTouchStart = (e) => {
  touchStartY.current = e.touches[0].clientY;
};

const onTouchMove = (e) => {
  const currentPhase = phaseRef.current;

  if (currentPhase === 'unlocked') return;

  e.preventDefault();

  const currentY = e.touches[0].clientY;
  const delta = (touchStartY.current - currentY) * 0.01;

  update(delta);
  touchStartY.current = currentY;
};

  const cleanup = () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeyDown);
window.removeEventListener('touchstart', onTouchStart);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
window.addEventListener('touchstart', onTouchStart, { passive: false });

  return () => {
    cleanup();

  };
}, []);

useEffect(() => {
  if (phase === 'unlocked') {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  }
}, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = engagementDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#f8f2eb] text-[#4a1d2b] min-h-screen">
{/* Cinematic Image Door Intro */}
<div
  className={`fixed inset-0 z-[999] pointer-events-none transition-opacity duration-700 ${
phase === 'doors' ? 'opacity-100' : 'opacity-0'
  }`}
>

  {/* DO NOT USE FULL BLACK OVERLAY (this was your issue) */}
  <div
    className="absolute inset-0 transition-opacity duration-700"
    style={{
      opacity: phase === 'unlocked' ? 0 : 1,
      background: 'rgba(0,0,0,0.15)', // very light cinematic tint
    }}
  />

  {/* LEFT DOOR */}
  <div
    className="absolute left-0 top-0 h-full w-1/2 overflow-hidden transform-gpu will-change-transform"
    style={{
      transform: `translateX(-${openProgress * 100}%)`,
    }}
  >
    <img
      src="/door-left.jpg"
      alt="Left Door"
      className="absolute inset-0 w-full h-full object-cover object-center"
      draggable={false}
    />
  </div>

  {/* RIGHT DOOR */}
  <div
    className="absolute right-0 top-0 h-full w-1/2 overflow-hidden transform-gpu will-change-transform"
    style={{
      transform: `translateX(${openProgress * 100}%)`,
    }}
  >
    <img
      src="/door-right.jpg"
      alt="Right Door"
      className="absolute inset-0 w-full h-full object-cover object-center"
      draggable={false}
    />
  </div>

  {/* CENTER SEAM (only visual accent, no lingering artifact) */}
  <div
    className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-white/20"
    style={{
      opacity: 1 - openProgress,
    }}
  />

  {/* TEXT OVERLAY */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
    <p className="text-[#800020] uppercase tracking-[0.5em] text-xs sm:text-sm mb-4">
      Welcome To
    </p>

    <h1 className="text-[#800020] text-5xl sm:text-7xl md:text-8xl font-light tracking-tight mb-6">
      Sakshi & Mrunank
    </h1>

    <p className="text-[#800020] text-sm sm:text-lg tracking-[0.3em] uppercase">
      Scroll To Open The Gates
    </p>

    <div className="mt-8 animate-bounce text-white text-3xl">
      ↓
    </div>
  </div>

</div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] rounded-full bg-yellow-100 opacity-20 blur-3xl"></div>
      </div>

      {/* HERO */}
      <section className="h-screen flex items-center justify-center px-4 sm:px-6 relative">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10 sm:py-16">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1 px-1">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 border border-[#e7d3c1] text-[#9c6e5f] tracking-[0.3em] uppercase text-xs mb-8 shadow-md">
              <span>✨</span>
              Our Forever Begins
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-light leading-tight sm:leading-none mb-6 tracking-tight text-[#5b2333]">
              Sakshi
              <span className="block text-[#9c6e5f] text-4xl md:text-5xl my-3 font-serif">
                &
              </span>
              Mrunank
            </h1>

            <p className="text-base sm:text-xl md:text-2xl leading-8 sm:leading-relaxed text-[#6e4653] max-w-2xl mx-auto lg:mx-0 mb-8 sm:mb-10 px-2 sm:px-0">
              Join us as we celebrate the beginning of a beautiful journey filled with love, laughter, traditions, and forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-[#e7d3c1] px-4 sm:px-5 py-4 rounded-2xl shadow-lg w-full sm:w-auto">
                <span className="text-xl">📅</span>
                <div>
                  <div className="text-sm uppercase tracking-widest text-[#9c6e5f]">
                    Engagement
                  </div>
                  <div className="text-lg">July 4, 2026</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-[#e7d3c1] px-4 sm:px-5 py-4 rounded-2xl shadow-lg w-full sm:w-auto">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-sm uppercase tracking-widest text-[#9c6e5f]">
                    Location
                  </div>
                  <div className="text-lg">Nagpur, India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Logo */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-yellow-100 blur-3xl opacity-40 scale-110 rounded-full"></div>

              <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden border border-[#e4cab7] bg-white/50 backdrop-blur-xl shadow-2xl max-w-[320px] sm:max-w-[420px] lg:max-w-[520px]">
                <img
                  src="logo.png"
                  alt="Wedding Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <Section
        icon={<span className="text-3xl">💖</span>}
        title="Countdown"
      >
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-5 text-center">
          <CountdownCard label="Days" value={timeLeft.days} />
          <CountdownCard label="Hours" value={timeLeft.hours} />
          <CountdownCard label="Minutes" value={timeLeft.minutes} />
          <CountdownCard label="Seconds" value={timeLeft.seconds} />
        </div>
      </Section>

      {/* OUR STORY */}
      <Section
        icon={<span className="text-3xl">💞</span>}
        title="Our Story"
      >
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
      <Section
        icon={<span className="text-3xl">🗓️</span>}
        title="Event Details"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
          {[
            {
              title: 'Engagement Ceremony',
              date: 'July 4, 2026',
              desc: 'An evening of celebration, rings, family, and joy.',
            },
            {
              title: 'Wedding Ceremony',
              date: 'December 28, 2026',
              desc: 'The beginning of forever with blessings from everyone we love.',
            },
            {
              title: 'Reception',
              date: 'Coming Soon',
              desc: 'A night of music, dancing, memories, and celebration.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-3xl p-6 sm:p-8 shadow-xl hover:-translate-y-1 transition-all"
            >
              <h3 className="text-2xl mb-3 text-[#5b2333]">{item.title}</h3>
              <p className="uppercase tracking-[0.25em] text-xs text-[#9c6e5f] mb-5">
                {item.date}
              </p>
              <p className="leading-8 text-[#6a4754]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* GALLERY PLACEHOLDER */}
      <Section
        icon={<span className="text-3xl">📸</span>}
        title="Gallery"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="aspect-square rounded-2xl sm:rounded-3xl bg-white/60 border border-[#e7d3c1] shadow-xl flex items-center justify-center text-[#9c6e5f] text-sm sm:text-lg"
            >
              Photo {item}
            </div>
          ))}
        </div>
      </Section>

      {/* RSVP */}
      <Section
        icon={<span className="text-3xl">🎶</span>}
        title="RSVP"
      >
        <div className="max-w-2xl mx-auto bg-white/65 backdrop-blur-xl border border-[#e7d3c1] rounded-[28px] sm:rounded-[40px] p-5 sm:p-10 shadow-2xl">
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
            />

            <select className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none text-[#6a4754]">
              <option>Will you attend?</option>
              <option>Yes, absolutely!</option>
              <option>Sadly, cannot make it</option>
            </select>

            <textarea
              rows={4}
              placeholder="Message for the couple"
              className="w-full px-5 py-4 rounded-2xl border border-[#e4cab7] bg-white/80 outline-none text-base"
            />

            <button
              type="submit"
              className="w-full bg-[#5b2333] hover:bg-[#471926] transition-all text-white py-4 rounded-2xl tracking-[0.25em] uppercase text-sm shadow-xl"
            >
              Send RSVP
            </button>
          </form>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="py-14 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_#f5b6c5,_transparent_35%),radial-gradient(circle_at_bottom_right,_#f3d7a6,_transparent_35%)]"></div>

        <div className="relative z-10">
          <p className="text-4xl md:text-5xl font-light text-[#5b2333] mb-4">
            Sakshi & Mrunank
          </p>

          <p className="uppercase tracking-[0.35em] text-sm text-[#9c6e5f] mb-8">
            July 4, 2026 • Nagpur
          </p>

          <div className="flex justify-center gap-3 text-[#9c6e5f] items-center">
            <span>💖</span>
            <span>Forever Begins Here</span>
            <span>💖</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
