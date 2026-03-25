import { Suspense } from "react";
import { SignInForm } from "./SignInForm";
import { LoginRedirect } from "./LoginRedirect";

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-salon-cream">
      <div className="font-body text-salon-brown-muted">جاري التحميل...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginRedirect>
        <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-salon-cream">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5">
              <div className="text-center mb-10">
                <h1 className="font-display text-3xl font-bold text-salon-brown">
                  تسجيل الدخول
                </h1>
                <p className="mt-2 font-body text-salon-brown-muted">
                  صالون شهد
                </p>
              </div>
              <SignInForm />
              <p className="mt-6 text-center font-body text-sm text-salon-brown-muted">
                <a href="/" className="text-salon-gold hover:underline">
                  العودة للرئيسية
                </a>
              </p>
            </div>
            <p className="mt-6 text-center font-body text-sm text-salon-brown-muted">
              ليس لديكِ حساب؟{" "}
              <a href="/register" className="text-salon-gold hover:underline">
                إنشاء حساب
              </a>
            </p>
          </div>
        </div>
      </LoginRedirect>
    </Suspense>
  );
}
