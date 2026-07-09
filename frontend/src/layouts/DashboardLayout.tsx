import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

export default function DashboardLayout() {
  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <main className="p-6 bg-slate-100 min-h-screen">

          <Outlet />

        </main>

      </div>

    </div>

  );
}