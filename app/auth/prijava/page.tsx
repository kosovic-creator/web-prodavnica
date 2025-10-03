'use client'
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FaSignInAlt, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import '@/i18n/config';

export default function PrijavaPage() {
  const { t } = useTranslation('auth');
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
      setError(t('login.invalidCredentials'));
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaSignInAlt className="text-violet-600" />
        {t('login.title')}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaEnvelope className="text-violet-600" />
          <input
            type="email"
            placeholder={t('login.email')}
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
            placeholder={t('login.password')}
            className="flex-1 outline-none bg-transparent"
            value={lozinka}
            onChange={e => setLozinka(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition">
          <FaSignInAlt />
          {t('login.login')}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {/* OAuth Provider buttons */}
      <div className="mt-6 space-y-3">
        <div className="text-center text-gray-500 text-sm">
          {t('login.orContinueWith')}
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
        >
          <FaGoogle />
          {t('login.loginWithGoogle')}
        </button>
      </div>

      {/* Registration link */}
      <div className="mt-6 text-center border-t pt-4">
        <p className="text-gray-600">
          {t('login.noAccount')} {' '}
          <button
            onClick={() => router.push('/auth/registracija')}
            className="text-violet-600 hover:text-violet-800 font-medium underline transition-colors"
          >
            {t('login.registerHere')}
          </button>
        </p>
      </div>
    </div>
  );
}