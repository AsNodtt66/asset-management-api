import {
  LayoutDashboard,
  Package,
  Warehouse,
  Wrench,
  ShieldCheck,
  FileText,
  UserCircle2,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Management Asset",
    icon: Package,
    path: "/asset",
  },
  {
    title: "Warehouse",
    icon: Warehouse,
    path: "/warehouse",
  },
  {
    title: "Maintenance",
    icon: Wrench,
    path: "/maintenance",
  },
  {
    title: "RBAC",
    icon: ShieldCheck,
    path: "/rbac",
  },
  {
    title: "Report",
    icon: FileText,
    path: "/report",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">

      {/* Logo */}

      <div className="flex h-16 items-center justify-center border-b border-slate-700">

        <h1 className="text-xl font-bold">

          PINDAD AMS

        </h1>

      </div>

      {/* Profile */}

      <div
        onClick={() => navigate("/dashboard/profile")}
        className="cursor-pointer border-b border-slate-700 p-5 hover:bg-slate-800"
      >

        <div className="flex items-center gap-3">

          <UserCircle2 size={45} />

          <div>

            <h3 className="font-semibold">

              Administrator

            </h3>

            <p className="text-sm text-gray-300">

              NIP : 100001

            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <nav className="flex-1 p-4">

        {menus.map((menu) => {

          const Icon = menu.icon;

          return (

            <button
              key={menu.title}
              onClick={() => navigate(menu.path)}
              className="mb-2 flex w-full items-center gap-3 rounded-lg p-3 transition hover:bg-slate-800"
            >

              <Icon size={20} />

              {menu.title}

            </button>

          );

        })}

      </nav>

      {/* Logout */}

      <div className="p-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg bg-red-600 p-3 transition hover:bg-red-700"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}