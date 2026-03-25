"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, Award, Users, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Premium mesh gradient - luxury feel */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(201, 168, 130, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(212, 184, 150, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232, 221, 212, 0.4) 0%, transparent 70%),
            linear-gradient(160deg, #FDF9F4 0%, #F3E9DE 30%, #E8DCCE 60%, #EDE4D8 85%, #F5EDE4 100%)
          `,
        }}
      />

      {/* Vignette - cinematic depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(74,63,53,0.08)]" aria-hidden />

      {/* Large dramatic orbs - intensified */}
      <motion.div
        className="absolute -top-80 -right-80 h-[900px] w-[900px] rounded-full bg-gradient-to-br from-[#C9A882]/35 via-[#D4B896]/15 to-transparent blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-80 -left-80 h-[850px] w-[850px] rounded-full bg-gradient-to-tr from-[#D4B896]/30 via-[#B8956F]/15 to-transparent blur-[100px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 8, repeat: Infinity }}
        aria-hidden
      />
      <motion.div
        className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A882]/25 blur-[150px]"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity }}
        aria-hidden
      />

      {/* Multi-layer pattern - dots + hexagon feel */}
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9A882 2px, transparent 0)", backgroundSize: "36px 36px" }} aria-hidden />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,168,130,0.3) 40px, rgba(201,168,130,0.3) 41px)" }} aria-hidden />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(184,149,111,0.2) 40px, rgba(184,149,111,0.2) 41px)" }} aria-hidden />

      {/* Ornate corner frames - luxury borders (hidden on mobile) */}
      <div className="absolute top-0 right-0 w-80 h-80 border-t-4 border-r-4 border-[#C9A882]/30 rounded-tr-[4rem] hidden md:block" aria-hidden />
      <div className="absolute bottom-0 left-0 w-80 h-80 border-b-4 border-l-4 border-[#C9A882]/30 rounded-bl-[4rem] hidden md:block" aria-hidden />
      <div className="absolute top-16 right-16 w-48 h-48 border-t-2 border-r-2 border-[#D4B896]/40 rounded-tr-3xl hidden md:block" aria-hidden />
      <div className="absolute bottom-16 left-16 w-48 h-48 border-b-2 border-l-2 border-[#D4B896]/40 rounded-bl-3xl hidden md:block" aria-hidden />
      <div className="absolute top-32 right-32 w-24 h-24 border-t-2 border-r-2 border-[#B8956F]/30 rounded-tr-xl hidden lg:block" aria-hidden />
      <div className="absolute bottom-32 left-32 w-24 h-24 border-b-2 border-l-2 border-[#B8956F]/30 rounded-bl-xl hidden lg:block" aria-hidden />

      {/* Floating sparkles - premium glow (fewer on mobile) */}
      <motion.div className="absolute top-24 right-[10%] w-4 h-4 rounded-full bg-[#C9A882]/60 shadow-[0_0_30px_rgba(201,168,130,0.6),0_0_60px_rgba(201,168,130,0.3)] hidden sm:block" animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }} transition={{ duration: 2.5, repeat: Infinity }} aria-hidden />
      <motion.div className="absolute top-1/3 left-[5%] w-3 h-3 rounded-full bg-[#D4B896]/50 shadow-[0_0_25px_rgba(212,184,150,0.5)] hidden sm:block" animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.6, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.3 }} aria-hidden />
      <motion.div className="absolute bottom-1/3 right-[12%] w-5 h-5 rounded-full bg-[#B8956F]/45 shadow-[0_0_35px_rgba(184,149,111,0.5)] hidden sm:block" animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.4, 1] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.8 }} aria-hidden />
      <motion.div className="absolute top-2/3 left-[15%] w-2.5 h-2.5 rounded-full bg-[#C9A882]/55 shadow-[0_0_20px_rgba(201,168,130,0.5)] hidden sm:block" animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.7, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} aria-hidden />
      <motion.div className="absolute top-1/4 right-[25%] w-2 h-2 rounded-full bg-[#D4B896]/50 hidden sm:block" animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.8, 1] }} transition={{ duration: 3.2, repeat: Infinity, delay: 2 }} aria-hidden />

      {/* Premium border accents - golden glow */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-transparent via-[#C9A882]/50 to-transparent shadow-[0_0_20px_rgba(201,168,130,0.3)]" aria-hidden />
      <div className="absolute bottom-0 right-0 left-0 h-1.5 bg-gradient-to-l from-transparent via-[#C9A882]/40 to-transparent shadow-[0_0_15px_rgba(201,168,130,0.2)]" aria-hidden />

      {/* Content - centered, elegant */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-24 md:px-10 md:py-28 lg:px-16">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <span className="inline-flex items-center gap-2 sm:gap-3 rounded-full border-2 border-[#C9A882]/40 bg-white/98 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 font-body text-xs sm:text-sm font-semibold tracking-widest text-[#5C5046] shadow-[0_8px_32px_rgba(201,168,130,0.2),0_0_0_1px_rgba(201,168,130,0.1)] backdrop-blur-xl">
            <motion.span animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#C9A882] drop-shadow-[0_0_8px_rgba(201,168,130,0.5)]" />
            </motion.span>
            تجربة فريدة من نوعها
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-4 sm:mb-6 max-w-3xl font-display text-[2rem] font-bold leading-[1.15] text-[#4A3F35] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem]"
        >
          <span className="block tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]">عالم من</span>
          <span className="mt-3 block hero-gradient-text">
            الجمال والأناقة
          </span>
        </motion.h1>

        {/* Premium divider - ornate diamond */}
        <motion.div
          initial={{ scaleX: 1, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8 flex items-center gap-6"
        >
          <div className="h-0.5 flex-1 max-w-24 bg-gradient-to-l from-[#C9A882] via-[#D4B896] to-transparent" />
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-5 h-5 rotate-45 bg-gradient-to-br from-[#C9A882] via-[#D4B896] to-[#B8956F] shadow-[0_0_25px_rgba(201,168,130,0.6),0_0_50px_rgba(201,168,130,0.3)] ring-4 ring-[#C9A882]/20" />
            <div className="absolute w-2 h-2 rotate-45 bg-white/80" />
          </motion.div>
          <div className="h-0.5 flex-1 max-w-24 bg-gradient-to-r from-[#C9A882] via-[#D4B896] to-transparent" />
        </motion.div>

        <motion.p
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-8 sm:mb-12 max-w-2xl font-body text-base sm:text-lg leading-[1.9] text-[#6B5D52] md:text-xl"
        >
          اكتشفي تجربة جمالية استثنائية حيث تلتقي الفخامة بالابتكار في صالون شهد للعناية بالجمال
        </motion.p>

        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-10 sm:mb-16 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none sm:w-auto"
        >
          <Link href="/book" className="w-full sm:w-auto">
            <motion.span
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-gradient-to-l from-[#B8956F] via-[#C9A882] to-[#D4B896] w-full sm:w-auto min-h-[48px] px-8 sm:px-12 py-4 sm:py-5 font-body text-base font-semibold text-white shadow-[0_20px_50px_rgba(201,168,130,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(201,168,130,0.5),0_0_40px_rgba(201,168,130,0.3)]"
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }} />
              <span className="relative z-10">احجزي موعدك الآن</span>
              <span className="relative z-10 text-xl opacity-95 transition-transform duration-300 group-hover:-translate-x-1">←</span>
            </motion.span>
          </Link>

          <Link href="/services" className="w-full sm:w-auto">
            <motion.span
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#C9A882]/40 bg-white/98 w-full sm:w-auto min-h-[48px] px-8 sm:px-12 py-4 sm:py-5 font-body text-base font-semibold text-[#5C5046] shadow-[0_8px_30px_rgba(61,52,41,0.1)] backdrop-blur-sm transition-all duration-300 hover:border-[#C9A882]/60 hover:bg-white hover:shadow-[0_15px_40px_rgba(201,168,130,0.2)]"
            >
              استكشف خدماتنا
            </motion.span>
          </Link>
        </motion.div>

        {/* Stats - card style with icons */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-4 md:gap-6"
        >
          {[
            { number: "10+", label: "سنوات الخبرة", icon: Award },
            { number: "25K+", label: "عميلة راضية", icon: Users },
            { number: "10+", label: "خدمة متميزة", icon: Star },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -8, scale: 1.03 }}
              className="rounded-2xl border-2 border-[#E8DDD4] bg-white/90 px-6 py-6 shadow-[0_12px_40px_rgba(61,52,41,0.1)] backdrop-blur-xl transition-all duration-300 hover:border-[#C9A882]/50 hover:bg-white hover:shadow-[0_25px_60px_rgba(201,168,130,0.25),0_0_0_1px_rgba(201,168,130,0.15)]"
            >
              <Icon className="mx-auto mb-3 h-6 w-6 text-[#C9A882] drop-shadow-[0_0_8px_rgba(201,168,130,0.3)]" />
              <div className="font-display text-2xl font-bold leading-tight text-[#C9A882] sm:text-3xl">
                {stat.number}
              </div>
              <div className="mt-1 font-body text-sm text-[#6B5D52]/90">{stat.label}</div>
            </motion.div>
          );
          })}
        </motion.div>
      </div>

      {/* Scroll indicator - premium */}
      <motion.div
        className="absolute bottom-6 sm:bottom-10 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="font-body text-xs font-semibold tracking-[0.3em] text-[#8B7355]/80">
            تصفح المزيد
          </span>
          <div className="flex h-10 w-7 items-start justify-center rounded-full border-2 border-[#C9A882]/50 bg-white/20 backdrop-blur-sm pt-3 shadow-[0_0_15px_rgba(201,168,130,0.2)]">
            <motion.div
              className="h-2 w-2 rounded-full bg-[#C9A882] shadow-[0_0_10px_rgba(201,168,130,0.5)]"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
