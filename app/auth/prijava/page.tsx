'use client'
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FaSignInAlt, FaEnvelope, FaLock, FaGoogle, FaSpinner } from "react-icons/fa";
import '@/i18n/config';

// Pomeri PrijavaSkeleton komponentu unutar glavne komponente ili u zasebnu komponentu
const PrijavaSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-10 bg-gray-300 rounded w-3/4 mx-auto mb-6"></div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-300 rounded"></div>
        <div className="h-12 bg-gray-300 rounded"></div>
        <div className="h-12 bg-gray-300 rounded"></div>
      </div>
      <div className="mt-6 space-y-4">
        <div className="h-12 bg-gray-300 rounded"></div>
      </div>
      <div className="mt-6 text-center border-t pt-4">
        <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function PrijavaForm() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Očisti prethodne greške
    setLoading(true);

    try {
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
    } catch {
      setError(t('login.errorOccurred') || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Prikazuje skeleton dok je loading true
  if (loading) {
    return <PrijavaSkeleton />;
  }

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
              disabled={loading}
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
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            {loading ? t('login.loggingIn') : t('login.login')}
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
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-red-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
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
              disabled={loading}
              className="text-violet-600 hover:text-violet-800 font-medium underline transition-colors disabled:opacity-50"
            >
              {t('login.registerHere')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

