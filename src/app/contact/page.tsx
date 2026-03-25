"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24">
      <div className="text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 bg-salon-cream/80 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full shadow-lg shadow-salon-gold/10 mb-4 sm:mb-6">
          <span className="text-salon-gold font-sans text-sm tracking-wide">
            أرسلي كرسالة
          </span>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-salon-brown mb-6">
          حددي موعد استشارة
        </h1>
        <p className="font-sans text-base sm:text-lg md:text-xl text-salon-brown-muted max-w-2xl mx-auto leading-relaxed px-2">
          نحبّ أن نسمع منكِ. تواصلي معنا عبر الهاتف، واتساب، أو أرسلي لنا رسالة.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-xl shadow-black/5">
          <h2 className="font-serif text-2xl font-bold text-salon-brown mb-6">
            أرسلي رسالة
          </h2>

          {submitted ? (
            <div className="py-14 text-center">
              <p className="font-sans font-bold text-salon-brown text-lg">
                شكراً لكِ على رسالتكِ!
              </p>
              <p className="font-sans text-salon-brown-muted mt-2">
                سنتواصل معكِ في أقرب وقت ممكن.
              </p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => setSubmitted(false)}
              >
                إرسال رسالة أخرى
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-right">
                <label className="block font-sans text-salon-brown mb-2 font-medium">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-6 py-4 bg-salon-cream/50 border border-salon-cream-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-salon-gold/50 focus:border-transparent transition-all duration-300 font-sans text-right"
                  placeholder="أدخلي اسمك الكامل"
                />
              </div>
              <div className="text-right">
                <label className="block font-sans text-salon-brown mb-2 font-medium">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-6 py-4 bg-salon-cream/50 border border-salon-cream-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-salon-gold/50 focus:border-transparent transition-all duration-300 font-sans text-right"
                  placeholder="example@email.com"
                />
              </div>
              <div className="text-right">
                <label className="block font-sans text-salon-brown mb-2 font-medium">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full px-6 py-4 bg-salon-cream/50 border border-salon-cream-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-salon-gold/50 focus:border-transparent transition-all duration-300 font-sans text-right"
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div className="text-right">
                <label className="block font-sans text-salon-brown mb-2 font-medium">
                  الرسالة
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, message: e.target.value }))
                  }
                  className="w-full px-6 py-4 bg-salon-cream/50 border border-salon-cream-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-salon-gold/50 focus:border-transparent transition-all duration-300 font-sans text-right resize-none"
                  placeholder="أخبرينا بالمزيد عن متطلباتك"
                />
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-sans font-medium text-lg hover:scale-[1.02]"
              >
                إرسال الطلب
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <a
            href="https://www.google.com/maps/search/ام+الفحم+حارة+الجبارين"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-salon-gold/10 transition-all duration-300 block"
          >
            <div className="flex items-start gap-6 text-right">
              <div className="flex-1">
                <h4 className="font-sans font-bold text-salon-brown mb-3 text-lg">
                  العنوان
                </h4>
                <p className="font-sans text-salon-brown-muted leading-relaxed">
                  ام الفحم حارة الجبارين
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-salon-gold/20 to-salon-gold-light/20 rounded-2xl flex items-center justify-center text-salon-gold flex-shrink-0">
                <MapPin className="w-7 h-7" />
              </div>
            </div>
          </a>

          <a
            href="tel:+972523113828"
            className="bg-white rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-salon-gold/10 transition-all duration-300 block"
          >
            <div className="flex items-start gap-6 text-right">
              <div className="flex-1">
                <h4 className="font-sans font-bold text-salon-brown mb-3 text-lg">
                  الهاتف
                </h4>
                <p className="font-sans text-salon-brown-muted leading-relaxed" dir="ltr">
                  052-311-3828
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-salon-gold/20 to-salon-gold-light/20 rounded-2xl flex items-center justify-center text-salon-gold flex-shrink-0">
                <Phone className="w-7 h-7" />
              </div>
            </div>
          </a>

          <a
            href="mailto:Arefajbareen3@gmail.com"
            className="bg-white rounded-3xl p-8 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-salon-gold/10 transition-all duration-300 block"
          >
            <div className="flex items-start gap-6 text-right">
              <div className="flex-1">
                <h4 className="font-sans font-bold text-salon-brown mb-3 text-lg">
                  البريد الإلكتروني
                </h4>
                <p className="font-sans text-salon-brown-muted leading-relaxed">
                  Arefajbareen3@gmail.com
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-salon-gold/20 to-salon-gold-light/20 rounded-2xl flex items-center justify-center text-salon-gold flex-shrink-0">
                <Mail className="w-7 h-7" />
              </div>
            </div>
          </a>

          <div className="bg-gradient-to-br from-salon-gold to-salon-gold-dark rounded-3xl p-8 shadow-lg shadow-salon-gold/20">
            <div className="flex items-start gap-6 text-right">
              <div className="flex-1">
                <h4 className="font-sans font-bold text-white mb-3 text-lg">
                  أوقات العمل
                </h4>
                <div className="space-y-2 font-sans text-white/90">
                  <p>السبت – الخميس: ٩ ص – ٩ م</p>
                </div>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                <Clock className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/book"
              className="inline-block px-12 py-5 bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-sans font-medium text-lg hover:scale-105"
            >
              احجزي موعدكِ الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
