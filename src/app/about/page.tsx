import Link from "next/link";
import Image from "next/image";
import { Award, Users, Clock, Shield } from "lucide-react";

const aboutImage = "/12345.jpg";

const features = [
  {
    icon: <Award className="w-6 h-6" />,
    title: "جودة مضمونة",
    description: "منتجات عالمية فاخرة",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "خبراء محترفون",
    description: "فريق متخصص ومدرب",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "مواعيد مرنة",
    description: "نعمل 7 أيام في الأسبوع",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "بيئة آمنة",
    description: "معايير عالية للنظافة",
  },
];

const serviceList = [
  "ليزر",
  "قص شعر",
  "صبغة",
  "إزالة الشعر بالحفوف",
  "فرد الشعر",
  "تسريحات",
  "علاج بشرة",
  "شالات",
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 md:py-24">
      <div className="text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 bg-salon-cream/80 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full shadow-lg shadow-salon-gold/10 mb-4 sm:mb-6">
          <span className="text-salon-gold font-sans text-sm tracking-wide">
            الرئيسية / من نحن
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-salon-brown">
          من نحن
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 md:gap-16 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
            <Image
              src={aboutImage}
              alt="صالون شهد"
              width={600}
              height={600}
              className="w-full h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-salon-brown/30 to-transparent" />
          </div>
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 md:-bottom-8 md:-right-8 bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-black/10 max-w-[180px] sm:max-w-xs">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-salon-gold to-salon-gold-dark rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-right flex-1">
                <div className="font-serif text-3xl font-bold text-salon-brown">
                  10+
                </div>
                <div className="font-sans text-sm text-salon-brown-muted">
                  سنة من التميز
                </div>
              </div>
            </div>
            <p className="font-sans text-sm text-salon-brown-muted text-right leading-relaxed">
              نفخر بتقديم خدمات جمالية استثنائية منذ أكثر من 10 أعوام
            </p>
          </div>
        </div>

        <div className="text-right order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg shadow-salon-gold/10 mb-6">
            <span className="text-salon-gold font-sans text-sm tracking-wide">
              فلسفة الجمال
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-salon-brown mb-6 leading-tight">
            وجهتك للجمال
            <br />
            <span className="text-salon-gold">والرفاهية</span>
          </h2>
          <p className="font-sans text-lg text-salon-brown-muted leading-relaxed mb-6">
            ولد صالون شهد من إيمان بسيط: كل امرأة تستحق أن تشعر بالجمال. منذ
            تأسيسنا، نما الصالون من استوديو صغير إلى وجهة محبوبة لعشاق الشعر
            والجمال في المدينة.
          </p>
          <p className="font-sans text-lg text-salon-brown-muted leading-relaxed mb-10">
            اسمنا—شهد—يعكس مهمتنا: أن نضفي على كل عميلة نخدمها حلاًوة وجمالاً
            يليق بها. نؤمن أن الشعر الجميل ليس مجرد قص أو صبغة؛ إنه ثقة، عناية
            ذاتية، وفرح الشعور بأفضل شكل لكِ.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {features.map((f, i) => (
              <div key={i} className="text-right">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-salon-gold/20 to-salon-gold-light/20 rounded-2xl text-salon-gold mb-3 mr-auto">
                  {f.icon}
                </div>
                <h4 className="font-sans font-bold text-salon-brown mb-1">
                  {f.title}
                </h4>
                <p className="font-sans text-sm text-salon-brown-muted">
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {serviceList.map((s) => (
              <div
                key={s}
                className="flex items-center gap-3 font-sans text-salon-brown-muted"
              >
                <span className="w-1.5 h-1.5 bg-salon-gold rounded-full flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>

          <Link
            href="/book"
            className="inline-block px-10 py-5 bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full hover:shadow-2xl hover:shadow-salon-gold/30 transition-all duration-500 font-sans font-medium text-lg hover:scale-105"
          >
            احجزي موعدكِ
          </Link>

          <div className="mt-10 pt-8 border-t border-salon-cream-border flex items-center gap-3 font-sans text-salon-brown-muted">
            <span>للدعم والاستفسارات:</span>
            <a
              href="tel:+972523113828"
              className="hover:text-salon-gold font-medium transition-colors"
            >
              052-311-3828
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
