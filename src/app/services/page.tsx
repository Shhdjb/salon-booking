import Link from "next/link";
import { getServices } from "@/app/actions/services";
import { isDatabaseConnectionError } from "@/lib/db-utils";
import { DatabaseUnavailable } from "@/components/ui/DatabaseUnavailable";
import { Gem } from "lucide-react";

export default async function ServicesPage() {
  try {
    const services = await getServices();
    const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24">
      <div className="text-center mb-12 sm:mb-16 md:mb-20">
        <div className="inline-flex items-center gap-2 bg-salon-cream/80 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full shadow-lg shadow-salon-gold/10 mb-4 sm:mb-6">
          <span className="text-salon-gold font-sans text-sm tracking-wide">
            خدماتنا
          </span>
          <Gem className="w-4 h-4 text-salon-gold" />
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-salon-brown mb-6">
          علاجات السبا
        </h1>
        <p className="font-sans text-base sm:text-lg md:text-xl text-salon-brown-muted max-w-2xl mx-auto leading-relaxed px-2">
          اكتشفي مجموعتنا الكاملة من خدمات العناية بالشعر والجمال. الأسعار والمدة حسب الحاجة عند وصولكِ.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category} className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-px bg-salon-cream-border" />
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-salon-brown font-bold">
              {category}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {services
              .filter((s) => s.category === category)
              .map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-salon-gold/20 transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-salon-gold/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-salon-brown font-bold">
                          {service.name}
                        </h3>
                        {!service.isActive && (
                          <span className="px-4 py-1.5 rounded-full bg-salon-cream text-salon-gold text-sm font-medium border border-salon-gold/30">
                            غير متاح
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-sans text-salon-brown-muted leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    {service.isActive && (
                      <Link
                        href={`/book?service=${service.id}`}
                        className="flex-shrink-0 px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] flex items-center justify-center bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-xl hover:shadow-salon-gold/30 transition-all duration-300 font-sans font-medium"
                      >
                        احجزي
                      </Link>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}

      <div className="text-center mt-12 sm:mt-16 md:mt-20">
        <Link
          href="/book"
          className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-sans font-medium text-base sm:text-lg hover:scale-105"
        >
          احجزي موعدكِ الآن
        </Link>
      </div>
    </div>
  );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <DatabaseUnavailable title="تعذر تحميل الخدمات" />;
    }
    throw error;
  }
}
