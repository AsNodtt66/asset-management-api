import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import type { LoginFormData } from "../../schemas/auth.schema";

export default function LoginForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    if (
      data.nip === "100001" &&
      data.password === "admin123"
    ) {
      navigate("/dashboard");
      return;
    }

    alert("NIP atau Password salah!");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* NIP */}

      <div>

        <label className="font-medium">
          NIP
        </label>

        <input
          {...register("nip")}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 focus:outline-none"
          placeholder="Masukkan NIP"
        />

        {errors.nip && (
          <p className="mt-1 text-sm text-red-500">
            {errors.nip.message}
          </p>
        )}

      </div>

      {/* PASSWORD */}

      <div>

        <label className="font-medium">
          Password
        </label>

        <input
          type="password"
          {...register("password")}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-600 focus:outline-none"
          placeholder="Masukkan Password"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}

      </div>

      {/* FORGOT PASSWORD */}

      <div className="flex justify-end">

        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Lupa Password?
        </Link>

      </div>

      {/* BUTTON */}

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Login
      </button>

    </form>
  );
}