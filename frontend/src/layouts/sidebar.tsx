import { NavLink } from "react-router-dom";

const menus = [
  { name: "Dashboard", path: "/" },
  { name: "Assets", path: "/assets" },
  { name: "Warehouse", path: "/warehouse" },
  { name: "Maintenance", path: "/maintenance" },
  { name: "Issues", path: "/issues" },
  { name: "Users", path: "/users" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white">
      <div className="p-5 text-2xl font-bold">
        Asset Management
      </div>

      <nav className="flex flex-col">

        {menus.map((menu) => (

          <NavLink
            key={menu.path}
            to={menu.path}
            className="px-5 py-3 hover:bg-slate-700 transition"
          >
            {menu.name}
          </NavLink>

        ))}

      </nav>
    </aside>
  );
}