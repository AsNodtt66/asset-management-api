import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

        <h1 className="text-3xl font-bold text-center">
          Lupa Password
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Masukkan email yang terdaftar
        </p>

        <ForgotPasswordForm />

      </div>

    </div>
  );
}