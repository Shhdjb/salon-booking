"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";

const packages = [
  { name: "باقة العناية الأساسية", price: "199", description: "عناية سريعة ومثالية لإطلالة مرتبة ومنعشة", features: ["قص شعر", "سشوار", "ترتيب وتصفيف نهائي"], popular: false },
  { name: "باقة الجمال الملكي", price: "349", description: "تجربة متكاملة للجمال والعناية بجلسة مميزة", features: ["قص شعر", "صبغة", "سشوار", "علاج خفيف للشعر"], popular: true },
  { name: "باقة المناسبات", price: "399", description: "تجهيز مثالي للمناسبات والإطلالات الخاصة", features: ["تسريحة مناسبة", "شالات أو تصفيف نهائي", "لمسة نهائية أنيقة"], popular: false },
  { name: "باقة العروس", price: "999", description: "باقة خاصة ليومك المميز بإطلالة راقية", features: ["تسريحة عروس", "شال / تصفيف نهائي", "تجربة أولية", "لمسات نهائية يوم المناسبة"], popular: false },
  { name: "باقة نعومة ولمعان", price: "299", description: "مناسبة لمن تريد شعرًا أنعم وأكثر حيوية", features: ["علاج شعر", "سشوار", "ترتيب نهائي"], popular: false },
];

export function SalonPackages() {
  return (
    <section className="py-32 bg-gradient-to-b from-white/95 via-[#F5EDE4]/30 to-white/95 backdrop-blur-sm relative overflow-hidden">
      <motion.div
        className="absolute top-40 right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#C9A882]/10 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-40 left-40 w-[700px] h-[700px] bg-gradient-to-tl from-[#D4B896]/10 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1.3, 1, 1.3], rotate: [360, 180, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-8">
            <motion.div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-xl px-8 py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
              <span className="text-[#C9A882] font-body font-medium tracking-wide">عروضنا الخاصة</span>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-5 h-5 text-[#C9A882]" />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.h3 initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-l from-[#4A3F35] via-[#6B5744] to-[#4A3F35] bg-clip-text text-transparent">باقات مميزة لكِ</span>
          </motion.h3>
          <motion.p initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-body text-xl md:text-2xl text-[#8B7355] max-w-3xl mx-auto leading-relaxed">
            اختاري الباقة المناسبة لك واستمتعي بتجربة جمالية متكاملة بأفضل الأسعار
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-20">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              <motion.div
                className={`relative rounded-[2rem] overflow-hidden ${pkg.popular ? "shadow-2xl shadow-[#C9A882]/30" : "shadow-xl shadow-black/5"}`}
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {pkg.popular && (
                  <motion.div className="absolute top-6 left-6 right-6 z-20" initial={{ rotate: -15, scale: 0 }} animate={{ rotate: -15, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                    <div className="bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white px-6 py-3 rounded-full shadow-xl text-center">
                      <span className="font-body font-bold text-sm">الأكثر شعبية</span>
                    </div>
                  </motion.div>
                )}
                <div className={`relative bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 ${pkg.popular ? "pt-16" : ""}`}>
                  <h4 className="font-display text-2xl font-bold text-[#4A3F35] mb-3 text-center">{pkg.name}</h4>
                  <p className="font-body text-[#8B7355] mb-6 text-center text-[0.9375rem] leading-relaxed">{pkg.description}</p>
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className={`font-display text-4xl font-bold ${pkg.popular ? "bg-gradient-to-l from-[#C9A882] to-[#B8956F] bg-clip-text text-transparent" : "text-[#C9A882]"}`}>{pkg.price}</span>
                      <span className="font-body text-[#8B7355] text-lg">₪</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 justify-center">
                        <motion.div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${pkg.popular ? "bg-gradient-to-br from-[#C9A882] to-[#B8956F]" : "bg-gradient-to-br from-[#E8DDD4] to-[#D4B896]"}`}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Check className={`w-4 h-4 ${pkg.popular ? "text-white" : "text-[#8B7355]"}`} />
                        </motion.div>
                        <span className="font-body text-[#8B7355] text-[0.9375rem]">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/book">
                    <motion.span
                      className={`block w-full py-5 rounded-full font-body font-medium text-lg text-center relative overflow-hidden ${pkg.popular ? "bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white" : "bg-gradient-to-l from-[#F5EDE4] to-[#E8DDD4] text-[#8B7355]"}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pkg.popular && (
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                      )}
                      <span className="relative z-10">احجزي الآن</span>
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative bg-gradient-to-br from-[#F5EDE4] via-white to-[#E8DDD4] rounded-[2.5rem] p-16 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C9A882]/20 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <div className="relative text-center">
            <h4 className="font-display text-3xl font-bold text-[#4A3F35] mb-5">تبحثين عن شيء مخصص؟</h4>
            <p className="font-body text-xl text-[#8B7355] mb-10 max-w-2xl mx-auto">تواصلي معنا لتصميم باقة خاصة تناسب احتياجاتك بالضبط</p>
            <Link href="/contact">
              <motion.span
                className="relative inline-flex items-center gap-3 px-16 py-6 bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium text-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                <span className="relative z-10">تحدثي مع فريقنا</span>
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
