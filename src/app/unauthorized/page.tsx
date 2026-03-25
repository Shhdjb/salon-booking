import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-salon-cream">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-8">
          <ShieldX className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl font-bold text-salon-brown mb-4">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </h1>
        <p className="font-body text-salon-brown-muted leading-relaxed mb-10">
          هذه الصفحة مخصصة للمسؤولين فقط. إذا كنتِ تعتقدين أن هذا خطأ، تواصلي مع إدارة الصالون.
        </p>
        <Link
          href="/"
          className="inline-block px-10 py-4 bg-gradient-to-l from-salon-gold to-salon-gold-dark text-white rounded-full font-body font-medium hover:shadow-xl hover:shadow-salon-gold/30 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
