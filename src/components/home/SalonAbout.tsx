"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Award, Users, Clock, Shield, Sparkles } from "lucide-react";
import { useState } from "react";

const aboutImage = "/12345.jpg";

const features = [
  { icon: <Award className="w-7 h-7" />, title: "جودة مضمونة", description: "منتجات عالمية فاخرة", color: "from-[#C9A882] to-[#B8956F]" },
  { icon: <Users className="w-7 h-7" />, title: "خبراء محترفون", description: "فريق متخصص ومدرب", color: "from-[#D4B896] to-[#C9A882]" },
  { icon: <Clock className="w-7 h-7" />, title: "مواعيد مرنة", description: "نعمل 7 أيام في الأسبوع", color: "from-[#B8956F] to-[#A67C52]" },
  { icon: <Shield className="w-7 h-7" />, title: "بيئة آمنة", description: "معايير عالية للنظافة", color: "from-[#C9A882] to-[#D4B896]" },
];

export function SalonAbout() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section id="about" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#F8F4EF] via-white to-[#F5EDE4] relative overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-[#C9A882]/20 to-[#D4B896]/5 rounded-full blur-[110px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-tl from-[#D4B896]/18 to-[#C9A882]/5 rounded-full blur-[100px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 14, repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9A882 1px, transparent 0)", backgroundSize: "40px 40px" }} aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 md:gap-20 items-center">
          <motion.div
            className="text-center order-2 lg:order-1"
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-4 sm:mb-6 md:mb-8">
              <motion.div className="inline-flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
                <span className="text-[#C9A882] font-body font-medium tracking-wide">من نحن</span>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-5 h-5 text-[#C9A882]" />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.h3
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight"
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="bg-gradient-to-l from-[#4A3F35] to-[#6B5744] bg-clip-text text-transparent">وجهتك للجمال</span>
              <br />
              <motion.span
                className="bg-gradient-to-l from-[#C9A882] to-[#B8956F] bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% auto" }}
              >
                والرفاهية
              </motion.span>
            </motion.h3>
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <motion.p className="font-body text-base sm:text-lg text-[#8B7355] leading-relaxed" initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                صالون شهد هو وجهتك المثالية للحصول على تجربة جمالية فاخرة ومتكاملة. منذ تأسيسنا، كنا ملتزمين بتقديم أعلى مستويات الخدمة والجودة لعملائنا الكرام.
              </motion.p>
              <motion.p className="font-body text-lg text-[#8B7355] leading-relaxed" initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                نجمع بين الخبرة العالمية والضيافة العربية الأصيلة، مستخدمين أفضل المنتجات والتقنيات الحديثة لضمان حصولك على النتائج التي تستحقينها.
              </motion.p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative text-center"
                  initial={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                >
                  <motion.div
                    className="relative bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/50"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(201, 168, 130, 0.2)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl text-white mb-2 sm:mb-4 mx-auto`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color}`}
                        animate={{ scale: hoveredFeature === index ? [1, 1.3, 1] : 1, opacity: hoveredFeature === index ? [0.5, 0, 0.5] : 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    <h4 className="font-body font-bold text-[#4A3F35] mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">{feature.title}</h4>
                    <p className="font-body text-xs sm:text-sm text-[#8B7355]">{feature.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <Link href="/about">
              <motion.span
                className="relative inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-12 md:px-14 py-4 sm:py-5 md:py-6 min-h-[48px] bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium text-base sm:text-lg overflow-hidden"
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                <span className="relative z-10">اعرف المزيد عنا</span>
              </motion.span>
            </Link>
          </motion.div>

          <motion.div className="order-1 lg:order-2" initial={{ opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative">
              <motion.div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden" whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}>
                <Image src={aboutImage} alt="لوجو صالون شهد" width={600} height={650} className="w-full h-[280px] sm:h-[400px] md:h-[550px] lg:h-[650px] object-contain object-center rounded-2xl sm:rounded-[2.5rem] bg-white/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/40 to-transparent rounded-2xl sm:rounded-[2.5rem]" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 md:-bottom-10 md:-right-10 bg-white/95 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 shadow-2xl max-w-[200px] sm:max-w-xs border border-white/50"
                initial={{ opacity: 1, y: 0, scale: 1 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ y: -10, boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.2)" }}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-4 mb-3 sm:mb-6 text-center">
                  <motion.div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#C9A882] to-[#B8956F] rounded-xl sm:rounded-[1.3rem] flex items-center justify-center" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>
                  <div>
                    <motion.div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-l from-[#C9A882] to-[#B8956F] bg-clip-text text-transparent" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      10+
                    </motion.div>
                    <div className="font-body text-xs sm:text-sm text-[#8B7355]">سنة من التميز</div>
                  </div>
                </div>
                <p className="font-body text-[10px] sm:text-xs md:text-sm text-[#8B7355] text-center leading-relaxed">نفخر بتقديم خدمات جمالية استثنائية منذ أكثر من 10 أعوام</p>
              </motion.div>
              <motion.div
                className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#C9A882]/20 to-[#D4B896]/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
