'use client'
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function OdjavaPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/auth/prijava" });
  }, []);
  return (
    <div className="flex items-center justify-center h-32 gap-2 text-violet-700 font-semibold">
      <FaSignOutAlt className="text-2xl" />
      <span>Odjavljujem...</span>
    </div>
  );
}