'use client';
import { useSession } from 'next-auth/react';
// import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { FaUser, FaSave, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import '@/i18n/config';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Skeleton komponenta za profil
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-center gap-2 mb-6 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-8 bg-gray-200 rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          {/* Profile image skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {/* Left column fields */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {/* Right column fields */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ProfilPage() {
  const { t } = useTranslation('profil');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    drzava: '',
    grad: '',
    postanskiBroj: '',
    adresa: '',
    uloga: 'korisnik',
    slika: '',
  });
  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/korisnici/${session.user.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user data');
            setError('Greška pri učitavanju Profila');
          }
          return res.json();
        })
        .then(data => {
          setForm({
            ime: data.ime || '',
            prezime: data.prezime || '',
            email: data.email || '',
            telefon: data.telefon || '',
            drzava: data.drzava || '',
            grad: data.grad || '',
            postanskiBroj: data.postanskiBroj?.toString() || '',
            adresa: data.adresa || '',
            uloga: data.uloga || 'korisnik',
            slika: data.slika || '',
          });
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          // Postaviti osnovne podatke iz session-a ako API poziv ne uspe
          setForm({
            ime: session.user.ime || '',
            prezime: session.user.prezime || '',
            email: session.user.email || '',
            telefon: '',
            drzava: '',
            grad: '',
            postanskiBroj: '',
            adresa: '',
            uloga: 'korisnik',
            slika: session.user.slika || '',
          });
        })
        .finally(() => {
          setUserLoaded(true);
        });
    } else if (status !== "loading") {
      // Ako nema session-a i nije loading, postavi userLoaded na true
      setUserLoaded(true);
    }
  }, [session?.user?.id, session?.user, status]);

  useEffect(() => {
    if (!session?.user && status !== "loading" && userLoaded) {
      toast.error('Morate biti prijavljeni', { duration: 4000 });
      router.push("/auth/prijava");
    }
  }, [session?.user, status, userLoaded, router]);

  if (status === "loading" || !userLoaded) {
    return <ProfileSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/korisnici', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('greska_pri_cuvanju'));
      } else {
        toast.success(t('korisnik_izmjenjen'));
        // setInterval(() => {
        //   setError('korisnik je izmjenjen');
        // }, 3000);

        setEditMode(false);
      }
    } catch {
      toast.error(t('greska_pri_cuvanju'));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('potvrdi_obrisi'))) return;
    setLoading(true);
    try {
      const res = await fetch('/api/korisnici', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('greska_pri_cuvanju'));
      } else {
        toast.success(t('korisnik_obrisan'));
        window.location.href = '/';
      }
    } catch {
      toast.error(t('greska_pri_cuvanju'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-violet-600" />
          {t('title')}
        </h1>

        {editMode ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="ime"
                  value={form.ime}
                  onChange={handleChange}
                  placeholder={t('name')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
                <input
                  name="prezime"
                  value={form.prezime}
                  onChange={handleChange}
                  placeholder={t('surname')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
              </div>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('email')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
              />
              <input
                name="telefon"
                value={form.telefon}
                onChange={handleChange}
                placeholder={t('phone')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="drzava"
                  value={form.drzava}
                  onChange={handleChange}
                  placeholder={t('country')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
                <input
                  name="grad"
                  value={form.grad}
                  onChange={handleChange}
                  placeholder={t('city')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="postanskiBroj"
                  value={form.postanskiBroj}
                  onChange={handleChange}
                  placeholder={t('postal_code')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
                <input
                  name="adresa"
                  value={form.adresa}
                  onChange={handleChange}
                  placeholder={t('address')}
                  className="border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
                />
              </div>
              <input
                name="slika"
                value={form.slika}
                onChange={handleChange}
                placeholder={t('profile_image')}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-base"
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  disabled={loading}
                >
                  <FaSave />
                  {t('sacuvaj_izmjene')}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  onClick={() => setEditMode(false)}
                >
                  <FaTimes />
                  {t('odkazivanje')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {/* {form.slika && (
                <div className="flex justify-center mb-6">
                  <Image src={form.slika} alt={t('profile_image') || "Profil"} width={120} height={120} className="rounded-full border-4 border-violet-200" />
                </div>
              )} */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('email')}</span>
                    <p className="text-base text-gray-800">{form.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('name')}</span>
                    <p className="text-base text-gray-800">{form.ime}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('surname')}</span>
                    <p className="text-base text-gray-800">{form.prezime}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('phone')}</span>
                    <p className="text-base text-gray-800">{form.telefon}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('role')}</span>
                    <p className="text-base text-gray-800">{form.uloga}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('country')}</span>
                    <p className="text-base text-gray-800">{form.drzava}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('city')}</span>
                    <p className="text-base text-gray-800">{form.grad}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('postal_code')}</span>
                    <p className="text-base text-gray-800">{form.postanskiBroj}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{t('address')}</span>
                    <p className="text-base text-gray-800">{form.adresa}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                <button className="flex-1 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 text-base font-medium" onClick={() => setEditMode(true)}>
                  <FaEdit />
                  {t('izmjeni_profil')}
                </button>
                <button className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium" onClick={handleDelete}>
                  <FaTrash />
                  {t('obrisi_korisnika')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}