import { Heart, Award, Sparkles, Shield } from "lucide-react";

const reasons = [
  { icon: Heart, title: "رعاية مخصصة", desc: "نفهم احتياجاتكِ الفريدة ونقدم لكِ تجربة مصممة خصيصاً لكِ." },
  { icon: Award, title: "جودة عالية", desc: "نستخدم أفضل المنتجات والتقنيات لضمان نتائج استثنائية." },
  { icon: Sparkles, title: "فريق محترف", desc: "خبراء في مجالهم، متحمسون لمساعدتكِ على الظهور بأفضل إطلالة." },
  { icon: Shield, title: "بيئة آمنة", desc: "معايير نظافة وصحة عالية لراحتكِ واطمئنانكِ." },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-salon-cream">
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-salon-brown font-bold">لماذا نحن</h2>
          <p className="text-salon-brown-muted mt-2 font-sans">لماذا تختارين صالون شهد؟</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-soft text-center md:text-right">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-salon-cream-border text-salon-brown mb-4">
                <item.icon size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-salon-brown font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-salon-brown-muted text-[0.9375rem] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
