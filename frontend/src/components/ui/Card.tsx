import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Card({ children }: Props) {
  return (
    <div className="rounded-xl bg-white shadow p-6">
      {children}
    </div>
  );
}