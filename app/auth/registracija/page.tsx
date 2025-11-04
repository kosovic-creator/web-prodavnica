'use client'

import { useState, useTransition } from "react";
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { registrujKorisnika } from '@/lib/actions';

export default function RegistracijaPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    lozinka: "",
    potvrdaLozinke: "",
    ime: "",
    prezime: ""
  });
  const { email, lozinka, potvrdaLozinke, ime, prezime } = form;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !lozinka || !potvrdaLozinke || !ime || !prezime) {
      toast.error('Sva polja su obavezna.');
      return;
    }
    
    if (lozinka !== potvrdaLozinke) {
      toast.error('Lozinke se ne poklapaju.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await registrujKorisnika({
          email,
          lozinka,
          ime,
          prezime
        });

        if (!result.success) {
          toast.error(result.error || t('register.error_occurred'));
          return;
        }

        toast.success(t('register.register_success'));
        router.push('/auth/prijava');
      } catch (error) {
        console.error('Registration error:', error);
        toast.error(t('register.error_occurred'));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaUserPlus className="text-blue-600" />
          {t('register.title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaEnvelope className="text-blue-600 text-lg flex-shrink-0" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focushover:border-blue-400 transition-colors !input-focus!ring-0"
              value={email}
              onChange={handleChange}
              placeholder={t('register.email')}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
              <FaUser className="text-blue-600 text-lg flex-shrink-0" />
              <input
                id="ime"
                name="ime"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md input-focushover:border-blue-400 transition-colors !input-focus!ring-0"
                value={ime}
                onChange={handleChange}
                placeholder={t('register.name')}
                disabled={isPending}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
              <FaUser className="text-blue-600 text-lg flex-shrink-0" />
              <input
                id="prezime"
                name="prezime"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md input-focushover:border-blue-400 transition-colors !input-focus!ring-0"
                value={prezime}
                onChange={handleChange}
                placeholder={t('register.surname')}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaLock className="text-blue-600 text-lg flex-shrink-0" />
            <input
              id="lozinka"
              name="lozinka"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focushover:border-blue-400 transition-colors !input-focus!ring-0"
              value={lozinka}
              onChange={handleChange}
              placeholder={t('register.password')}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-blue-400 transition-colors">
            <FaLock className="text-blue-600 text-lg flex-shrink-0" />
            <input
              id="potvrdaLozinke"
              name="potvrdaLozinke"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md input-focushover:border-blue-400 transition-colors !input-focus!ring-0"
              value={potvrdaLozinke}
              onChange={handleChange}
              placeholder="Potvrda lozinke"
              disabled={isPending}
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Registruje se...
              </>
            ) : (
              <>
                <FaUserPlus />
                {t('register.register')}
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {t('register.have_account')}{' '}
            <button
              onClick={() => router.push('/auth/prijava')}
              className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
              disabled={isPending}
            >
              {t('login.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}