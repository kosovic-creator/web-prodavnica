'use client'
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import '@/i18n/config';

export default function PrijavaPage() {
  const { t } = useTranslation('login');
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      lozinka,
    });
    if (!res?.error) {
      router.push("/");
    } else {
      setError("Pogrešan email ili lozinka");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaSignInAlt className="text-violet-600" />
        {t('title')}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaEnvelope className="text-violet-600" />
          <input
            type="email"
            placeholder={t('email')}
            className="flex-1 outline-none bg-transparent"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaLock className="text-violet-600" />
          <input
            type="password"
            placeholder={t('password')}
            className="flex-1 outline-none bg-transparent"
            value={lozinka}
            onChange={e => setLozinka(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition">
          <FaSignInAlt />
          {t('login')}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}