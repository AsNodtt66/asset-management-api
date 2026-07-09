import { UserCircle2 } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl">

      <div className="rounded-xl bg-white shadow">

        {/* Header */}

        <div className="border-b p-6">

          <h1 className="text-3xl font-bold">

            Profil Pengguna

          </h1>

          <p className="mt-1 text-gray-500">

            Informasi akun yang sedang login

          </p>

        </div>

        {/* Body */}

        <div className="grid grid-cols-3 gap-8 p-8">

          {/* Avatar */}

          <div className="flex flex-col items-center">

            <UserCircle2
              size={150}
              className="text-slate-500"
            />

            <button
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Ganti Foto
            </button>

          </div>

          {/* Biodata */}

          <div className="col-span-2 space-y-5">

            <ProfileItem
              label="Nama"
              value="Administrator"
            />

            <ProfileItem
              label="NIP"
              value="100001"
            />

            <ProfileItem
              label="Role"
              value="Admin"
            />

            <ProfileItem
              label="Divisi"
              value="TIK"
            />

            <ProfileItem
              label="Email"
              value="admin@pindad.com"
            />

            <ProfileItem
              label="No HP"
              value="081234567890"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">

        {label}

      </p>

      <h3 className="mt-1 rounded-lg border bg-gray-50 p-3 font-semibold">

        {value}

      </h3>

    </div>
  );
}