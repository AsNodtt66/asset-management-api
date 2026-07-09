import { Bell, UserCircle2 } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      <div>
        <h1 className="font-bold text-xl">
          Asset Management System
        </h1>
      </div>

      <div className="flex items-center gap-5">

        <Bell className="cursor-pointer"/>

        <div className="flex items-center gap-2">

          <UserCircle2 size={34}/>

          <div>

            <p className="font-semibold">
              Administrator
            </p>

            <p className="text-xs text-gray-500">
              admin@gmail.com
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}