import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLogin();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <label>Email</label>

        <input
          {...register("email")}
          className="w-full rounded-lg border p-3 mt-1"
          placeholder="Masukkan email"
        />

        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label>Password</label>

        <input
          type="password"
          {...register("password")}
          className="w-full rounded-lg border p-3 mt-1"
          placeholder="Masukkan password"
        />

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {errors.password.message}
          </p>
        )}
        
      </div>

      <div className="flex justify-end">
  <Link
    to="/forgot-password"
    className="text-sm text-blue-600 hover:underline"
  >
    Lupa Password?
  </Link>
</div>

      <button
        className="w-full rounded-lg bg-blue-600 text-white py-3 hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  );
}