"use client";

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white/95 to-[#F5EDE4]/95 backdrop-blur-sm relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C9A882]/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D4B896]/5 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-8">
            <motion.div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-xl px-8 py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
              <span className="text-[#C9A882] font-body font-medium tracking-wide">آراء العملاء</span>
              <Star className="w-5 h-5 text-[#C9A882] fill-current" />
            </motion.div>
          </motion.div>
          <motion.h3 initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-l from-[#4A3F35] via-[#6B5744] to-[#4A3F35] bg-clip-text text-transparent">ماذا يقول عملاؤنا</span>
          </motion.h3>
          <motion.p initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-body text-xl text-[#8B7355] max-w-3xl mx-auto leading-relaxed">
            نفخر بثقة عملائنا ورضاهم عن خدماتنا المميزة
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <motion.div
                className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 relative"
                whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(201, 168, 130, 0.3)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute top-6 left-6 w-14 h-14 bg-gradient-to-br from-[#C9A882]/10 to-[#D4B896]/10 rounded-2xl flex items-center justify-center text-[#C9A882]/40 group-hover:scale-110 transition-transform duration-300">
                  <Quote className="w-7 h-7" />
                </div>
                <div className="flex gap-1 mb-4 justify-center">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#C9A882] fill-current" />
                  ))}
                </div>
                <p className="font-body text-[#8B7355] leading-relaxed text-center">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 pt-4 border-t border-[#E8DDD4] text-center font-body text-sm text-[#8B7355]/80">إحدى العميلات</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "98%", label: "رضا العملاء" },
            { value: "500+", label: "تقييم إيجابي" },
            { value: "4.9", label: "متوسط التقييم" },
            { value: "24/7", label: "خدمة الحجز" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(201, 168, 130, 0.3)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
                <div className="font-display text-4xl font-bold bg-gradient-to-l from-[#C9A882] to-[#B8956F] bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="font-body text-sm text-[#8B7355]">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
