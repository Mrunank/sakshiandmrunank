"use client";

import React, { useEffect, useState } from 'react';

const engagementDate = new Date('2026-07-04T19:00:00');

function CountdownCard({ label, value }) {
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-[#e5cbb6] rounded-3xl px-6 py-8 shadow-xl min-w-[120px]">
      <div className="text-5xl md:text-6xl font-light text-[#5b2333] mb-2 tracking-tight">
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
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
    <div className="bg-[#f8f2eb] text-[#4a1d2b] overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] rounded-full bg-yellow-100 opacity-20 blur-3xl"></div>
      </div>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6 relative">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 border border-[#e7d3c1] text-[#9c6e5f] tracking-[0.3em] uppercase text-xs mb-8 shadow-md">
              <span>✨</span>
              Our Forever Begins
            </div>

            <h1 className="text-6xl md:text-8xl font-light leading-none mb-6 tracking-tight text-[#5b2333]">
              Sakshi
              <span className="block text-[#9c6e5f] text-4xl md:text-5xl my-3 font-serif">
                &
              </span>
              Mrunank
            </h1>

            <p className="text-xl md:text-2xl leading-relaxed text-[#6e4653] max-w-2xl mx-auto lg:mx-0 mb-10">
              Join us as we celebrate the beginning of a beautiful journey filled with love, laughter, traditions, and forever.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl border border-[#e7d3c1] px-5 py-4 rounded-2xl shadow-lg">
                <span className="text-xl">📅</span>
                <div>
                  <div className="text-sm uppercase tracking-widest text-[#9c6e5f]">
                    Engagement
                  </div>
                  <div className="text-lg">July 4, 2026</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl border border-[#e7d3c1] px-5 py-4 rounded-2xl shadow-lg">
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

              <div className="relative rounded-[40px] overflow-hidden border border-[#e4cab7] bg-white/50 backdrop-blur-xl shadow-2xl max-w-[520px]">
                <img
                  src="/logo.png"
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
        <div className="flex flex-wrap justify-center gap-5 text-center">
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
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
              className="bg-white/55 backdrop-blur-xl border border-[#e7d3c1] rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-all"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="aspect-square rounded-3xl bg-white/50 border border-[#e7d3c1] shadow-xl flex items-center justify-center text-[#9c6e5f] text-lg"
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
        <div className="max-w-2xl mx-auto bg-white/55 backdrop-blur-xl border border-[#e7d3c1] rounded-[40px] p-10 shadow-2xl">
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none"
            />

            <select className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none text-[#6a4754]">
              <option>Will you attend?</option>
              <option>Yes, absolutely!</option>
              <option>Sadly, cannot make it</option>
            </select>

            <textarea
              rows={4}
              placeholder="Message for the couple"
              className="w-full px-6 py-4 rounded-2xl border border-[#e4cab7] bg-white/70 outline-none"
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
      <footer className="py-20 px-6 text-center relative overflow-hidden">
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
