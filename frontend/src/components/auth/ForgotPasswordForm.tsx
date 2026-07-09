import { Link } from "react-router-dom";

export default function ForgotPasswordForm() {
  return (
    <form className="space-y-6">

      <div>
        <label className="block mb-2 font-medium">
          Email
        </label>

        <input
          type="email"
          placeholder="Masukkan email"
          className="w-full rounded-lg border border-gray-300 p-3"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 text-white py-3 hover:bg-blue-700"
      >
        Kirim Link Reset
      </button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-blue-600 hover:underline"
        >
          Kembali ke Login
        </Link>
      </div>

    </form>
  );
}