import { Outlet } from "react-router-dom";

export default function AuthLayout() {

  return (

    <div className="bg-slate-100">

      <Outlet />

    </div>

  );

}