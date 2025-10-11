'use client'
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FaSignInAlt, FaEnvelope, FaLock, FaGoogle, FaSpinner, FaChevronDown, FaUser, FaCheck } from "react-icons/fa";
import '@/i18n/config';

// Tip za skorašnje prijave
interface RecentLogin {
  email: string;
  lastUsed: string;
}

export default function PrijavaForm() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
  const [showRecentLogins, setShowRecentLogins] = useState(false);

  // Učitaj skorašnje prijave iz localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLogins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentLogins(parsed);
      } catch (error) {
        console.error('Greška pri učitavanju skorašnjih prijava:', error);
      }
    }

    // Učitaj zapamćene podatke
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedRememberMe && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Sačuvaj skorašnje prijave
  const saveRecentLogin = (email: string) => {
    const newLogin: RecentLogin = {
      email,
      lastUsed: new Date().toISOString()
    };

    const updatedLogins = [newLogin, ...recentLogins.filter(login => login.email !== email)]
      .slice(0, 5); // Zadrži samo 5 najnovijih

    setRecentLogins(updatedLogins);
    localStorage.setItem('recentLogins', JSON.stringify(updatedLogins));
  };

  // Funkcija za biranje skorašnje prijave
  const selectRecentLogin = (recentEmail: string) => {
    setEmail(recentEmail);
    setShowRecentLogins(false);
  };

  // Funkcija za uklanjanje skorašnje prijave
  const removeRecentLogin = (emailToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLogins = recentLogins.filter(login => login.email !== emailToRemove);
    setRecentLogins(updatedLogins);
    localStorage.setItem('recentLogins', JSON.stringify(updatedLogins));
  };

  // Zatvaranje padajućeg menija kada se klikne van njega
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.recent-logins-container')) {
        setShowRecentLogins(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        // Sačuvaj skorašnju prijavu
        saveRecentLogin(email);

        // Sačuvaj podatke ako je "Zapamti me" čekirano
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('rememberMe');
        }

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
    <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaSignInAlt className="text-blue-600" />
          {t('login.title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input sa skorašnjim prijavama */}
          <div className="relative recent-logins-container">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus">
              <FaEnvelope className="text-blue-600 text-lg flex-shrink-0" />
              <input
                type="email"
                placeholder={t('login.email')}
                className="flex-1 outline-none bg-transparent text-base"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {recentLogins.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecentLogins(!showRecentLogins)}
                  className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                  disabled={loading}
                  title={t('login.recentLogins')}
                >
                  <FaChevronDown className={`transition-transform duration-200 ${showRecentLogins ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Padajući meni za skorašnje prijave */}
            {showRecentLogins && recentLogins.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                <div className="p-2 text-sm font-medium text-gray-600 border-b">
                  {t('login.recentLogins')}
                </div>
                {recentLogins.map((login, index) => (
                  <div
                    key={index}
                    className="group flex items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => selectRecentLogin(login.email)}
                      className="flex-1 text-left p-3 flex items-center gap-2"
                      disabled={loading}
                    >
                      <FaUser className="text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {login.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(login.lastUsed).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeRecentLogin(login.email, e)}
                      className="p-2 mr-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      disabled={loading}
                      title="Ukloni"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus">
            <FaLock className="text-blue-600 text-lg flex-shrink-0" />
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

          {/* Zapamti me checkbox */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${rememberMe
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                  }`}>
                  {rememberMe && <FaCheck className="text-white text-xs" />}
                </div>
              </div>
              {t('login.rememberMe')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium cursor-pointer"
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
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium cursor-pointer"
          >
            <FaGoogle className="google-icon text-red-400" />
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
              className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors disabled:opacity-50"
            >
              {t('login.registerHere')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

