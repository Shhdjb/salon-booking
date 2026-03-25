"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Instagram } from "lucide-react";
import { useState } from "react";

export type SalonGalleryItem = {
  src: string;
  alt: string;
  title?: string | null;
};

const FALLBACK_ITEMS: SalonGalleryItem[] = [
  { src: "/IMG_0722.png", alt: "معرض صالون شهد 1" },
  { src: "/IMG_0725.png", alt: "معرض صالون شهد 2" },
  { src: "/IMG_0723.png", alt: "معرض صالون شهد 3" },
];

export function SalonGallery({ items }: { items?: SalonGalleryItem[] | null }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const galleryItems =
    items && items.length > 0 ? items : FALLBACK_ITEMS;

  return (
    <section id="gallery" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#F8F4EF] via-[#F2EBE3] to-[#FDF9F4] relative overflow-hidden">
      <motion.div
        className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-[#C9A882]/20 to-transparent rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-[550px] h-[550px] bg-gradient-to-tl from-[#D4B896]/18 to-transparent rounded-full blur-[90px]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9A882 1px, transparent 0)", backgroundSize: "44px 44px" }} aria-hidden />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block mb-4 sm:mb-6 md:mb-8">
            <a href="https://www.instagram.com/salonshahd2026?igsh=MWliYjI1OTBoeGFuOQ==" target="_blank" rel="noopener noreferrer">
              <motion.div className="inline-flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-xl shadow-[#C9A882]/10 border border-white/50" whileHover={{ scale: 1.05 }}>
                <span className="text-[#C9A882] font-body font-medium tracking-wide">تابعينا على إنستقرام</span>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Instagram className="w-5 h-5 text-[#C9A882]" />
                </motion.div>
              </motion.div>
            </a>
          </motion.div>
          <motion.h3 initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8">
            <span className="bg-gradient-to-l from-[#4A3F35] via-[#6B5744] to-[#4A3F35] bg-clip-text text-transparent">لحظات من الجمال</span>
          </motion.h3>
          <motion.p initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-[#8B7355] max-w-3xl mx-auto leading-relaxed px-2">
            اكتشفي أحدث إطلالاتنا وتحولات عملائنا المذهلة
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-10 sm:mb-14 md:mb-16">
          {galleryItems.map((image, index) => (
            <motion.div
              key={`${image.src}-${index}`}
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className={`group relative overflow-hidden rounded-3xl ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <motion.div className={`${index === 0 ? "h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px]" : "h-40 sm:h-56 md:h-72 lg:h-80"} relative overflow-hidden bg-gradient-to-br from-[#F5EDE4] to-[#E8DDD4]`} whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}>
                <motion.div className="absolute inset-0" animate={{ scale: hoveredIndex === index ? 1.1 : 1 }} transition={{ duration: 0.6 }}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                    unoptimized={image.src.startsWith("/uploads/")}
                  />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.a
                  href="https://www.instagram.com/salonshahd2026?igsh=MWliYjI1OTBoeGFuOQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`absolute inset-0 flex items-center justify-center ${hoveredIndex === index ? "pointer-events-auto" : "pointer-events-none"}`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Instagram className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.a>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <a href="https://www.instagram.com/salonshahd2026?igsh=MWliYjI1OTBoeGFuOQ==" target="_blank" rel="noopener noreferrer">
            <motion.span
              className="inline-flex items-center justify-center gap-2 sm:gap-4 px-8 sm:px-12 md:px-14 py-4 sm:py-5 md:py-6 min-h-[48px] bg-gradient-to-l from-[#E1306C] via-[#C13584] to-[#833AB4] text-white rounded-full font-body font-medium text-base sm:text-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }} />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <Instagram className="w-6 h-6 relative z-10" />
              </motion.div>
              <span className="relative z-10">تابعينا على إنستقرام</span>
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
