import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">
          Asset Management
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          PT Pindad (Persero)
        </p>

        <LoginForm />
      </div>
    </div>
  );
}