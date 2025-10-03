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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaSignInAlt className="text-violet-600" />
          {t('login.title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
            <FaEnvelope className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="email"
            placeholder={t('login.email')}
              className="flex-1 outline-none bg-transparent text-base"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
            <FaLock className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="password"
            placeholder={t('login.password')}
              className="flex-1 outline-none bg-transparent text-base"
            value={lozinka}
            onChange={e => setLozinka(e.target.value)}
            required
          />
        </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 transition-colors text-base font-medium">
          <FaSignInAlt />
          {t('login.login')}
        </button>
      </form>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

      {/* OAuth Provider buttons */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('login.orContinueWith')}</span>
            </div>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 bg-red-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors text-base font-medium"
        >
          <FaGoogle />
          {t('login.loginWithGoogle')}
        </button>
      </div>

      {/* Registration link */}
      <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {t('login.noAccount')}{' '}
          <button
            onClick={() => router.push('/auth/registracija')}
            className="text-violet-600 hover:text-violet-800 font-medium underline transition-colors"
          >
            {t('login.registerHere')}
          </button>
        </p>
      </div>
      </div>
    </div>
  );
}