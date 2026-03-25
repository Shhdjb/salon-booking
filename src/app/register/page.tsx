import { SignUpForm } from "./SignUpForm";
import { RegisterRedirect } from "./RegisterRedirect";

export default function RegisterPage() {
  return (
    <RegisterRedirect>
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-salon-cream">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-salon-brown">
              إنشاء حساب
            </h1>
            <p className="mt-2 font-body text-salon-brown-muted">
              انضمي لصالون شهد
            </p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-center font-body text-sm text-salon-brown-muted">
            لديكِ حساب؟{" "}
            <a href="/login" className="text-salon-gold hover:underline">
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
    </RegisterRedirect>
  );
}
