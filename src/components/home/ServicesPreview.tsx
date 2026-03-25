"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Scissors, Sparkles, Gem, ArrowLeft } from "lucide-react";
import { services } from "@/data/services";

const spaImage = "https://images.unsplash.com/photo-1760647422523-f532034a49ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const styleImage = "/123.jpg";
const laserImage = "/Laser.jpg";

const featuredServices = [
  { service: services.find((s) => s.id === "skin-treatment")!, icon: <Sparkles className="w-8 h-8" />, image: spaImage },
  { service: services.find((s) => s.id === "laser")!, icon: <Scissors className="w-8 h-8" />, image: laserImage },
  { service: services.find((s) => s.id === "occasion-hairstyles")!, icon: <Gem className="w-8 h-8" />, image: styleImage },
];

export function ServicesPreview() {
  return (
    <section id="services" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#F5EDE4] via-[#F8F4EF] to-white relative overflow-hidden">
      <motion.div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-gradient-to-br from-[#D4B896]/25 to-[#C9A882]/5 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-[750px] h-[750px] bg-gradient-to-tl from-[#C9A882]/20 to-[#D4B896]/5 rounded-full blur-[90px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9A882 1px, transparent 0)", backgroundSize: "36px 36px" }} aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
        <div className="text-center mb-12 sm:mb-16 md:mb-24">
          <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="inline-block mb-4 sm:mb-6 md:mb-8">
            <motion.div className="inline-flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
              <span className="text-[#C9A882] font-body font-medium tracking-wide">خدماتنا المميزة</span>
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Gem className="w-5 h-5 text-[#C9A882]" />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.h3 initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-l from-[#4A3F35] via-[#6B5744] to-[#4A3F35] bg-clip-text text-transparent">تجربة جمالية متكاملة</span>
          </motion.h3>
          <motion.p initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-[#8B7355] max-w-3xl mx-auto leading-relaxed px-2">
            نقدم مجموعة شاملة من الخدمات الفاخرة المصممة خصيصاً لتلبية احتياجاتك
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredServices.map((item, index) => (
            <motion.div
              key={item.service.id}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative"
            >
              <Link href={`/book?service=${item.service.id}`}>
                <motion.div className="relative bg-white rounded-[2rem] overflow-hidden" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                  <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-black/5">
                    <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                      <Image src={item.image} alt={item.service.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <motion.div className="absolute top-6 right-6" whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                        <div className="w-16 h-16 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center text-[#C9A882] shadow-xl">{item.icon}</div>
                      </motion.div>
                    </div>
                    <div className="p-8 text-center">
                      <h4 className="font-display text-2xl font-bold text-[#4A3F35] mb-4">{item.service.name}</h4>
                      <p className="font-body text-[#8B7355] leading-relaxed mb-6 line-clamp-2">{item.service.description}</p>
                      <motion.span className="inline-flex items-center gap-2 text-[#C9A882] font-body font-medium" whileHover={{ x: -5 }}>
                        <ArrowLeft className="w-4 h-4" />
                        <span>احجزي الآن</span>
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-12 sm:mt-16 md:mt-20 text-center">
          <Link href="/services">
            <motion.span
              className="relative inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 min-h-[48px] bg-gradient-to-l from-[#C9A882] to-[#B8956F] text-white rounded-full font-body font-medium text-base sm:text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
              <span className="relative z-10">عرض جميع الخدمات</span>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
