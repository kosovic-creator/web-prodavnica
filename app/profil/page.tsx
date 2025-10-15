/* eslint-disable @typescript-eslint/no-unused-vars */
 'use client';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaSave, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import '@/i18n/config';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Loading from '@/components/Loadning';


export default function ProfilPage() {
  const { t } = useTranslation('profil');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
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
    // ...existing code...
    podaciId: '',
  });
  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        try {
          const [korisnikRes] = await Promise.all([
            fetch(`/api/korisnici/${session.user.id}`),
          ]);
          const korisnik = korisnikRes.ok ? await korisnikRes.json() : null;
          setForm({
            ime: korisnik?.ime || session.user.ime || '',
            prezime: korisnik?.prezime || session.user.prezime || '',
            email: korisnik?.email || session.user.email || '',
            telefon: korisnik?.podaciPreuzimanja.telefon || '',
            drzava: korisnik?.podaciPreuzimanja.drzava || '',
            grad: korisnik?.podaciPreuzimanja.grad || '',
            postanskiBroj: korisnik?.podaciPreuzimanja.postanskiBroj?.toString() || '',
            adresa: korisnik?.podaciPreuzimanja.adresa || '',
            uloga: korisnik?.uloga || 'korisnik',
            // ...existing code...
            podaciId: korisnik?.podaciPreuzimanja?.id || '',
          });
        } catch {
          toast.error(t('greska_pri_ocitavanju'));
        } finally {
          setUserLoaded(true);
        }
      } else if (status !== "loading") {
        setUserLoaded(true);
      }
    }
    fetchData();
  }, [session?.user?.id, session?.user, status, t]);

  useEffect(() => {
    if (!session?.user && status !== "loading" && userLoaded) {
      toast.error('Morate biti prijavljeni', { duration: 4000 });
      router.push("/auth/prijava");
    }
  }, [session?.user, status, userLoaded, router]);

  if (status === "loading" || !userLoaded) {
    return <Loading />;
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
      // Update Korisnik
      const korisnikRes = await fetch('/api/korisnici', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          ime: form.ime,
          prezime: form.prezime,
          email: form.email,
          uloga: form.uloga,
          // ...existing code...
        }),
      });
      const korisnikData = await korisnikRes.json();
      // Update PodaciPreuzimanja
      let podaciRes;
      if (form.podaciId) {
        podaciRes = await fetch('/api/podaci-preuzimanja', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: form.podaciId,
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          }),
        });
      } else {
        podaciRes = await fetch('/api/podaci-preuzimanja', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            korisnikId: session.user.id,
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          }),
        });
      }
      const podaciData = await podaciRes.json();
      if (!korisnikRes.ok || !podaciRes.ok) {
        toast.error(korisnikData.error || podaciData.error || t('greska_pri_cuvanju'));
      } else {
        toast.success(t('korisnik_izmjenjen'));
        setEditMode(false);
      }
    } catch {
      toast.error(t('greska_pri_cuvanju'));
    }
    setLoading(false);
  };

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
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
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
                <input
                  name="prezime"
                  value={form.prezime}
                  onChange={handleChange}
                  placeholder={t('surname')}
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
              </div>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('email')}
                className="w-full border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
              />
              <input
                name="telefon"
                value={form.telefon}
                onChange={handleChange}
                placeholder={t('phone')}
                className="w-full border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="drzava"
                  value={form.drzava}
                  onChange={handleChange}
                  placeholder={t('country')}
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
                <input
                  name="grad"
                  value={form.grad}
                  onChange={handleChange}
                  placeholder={t('city')}
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="postanskiBroj"
                  value={form.postanskiBroj}
                  onChange={handleChange}
                  placeholder={t('postal_code')}
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
                <input
                  name="adresa"
                  value={form.adresa}
                  onChange={handleChange}
                  placeholder={t('address')}
                  className="border border-gray-300 p-3 rounded-lg input-focustransition-all text-base"
                />
              </div>
              {/* Polje za sliku uklonjeno */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
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
                {/* Prikaz slike uklonjen */}

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
                  <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium" onClick={() => setEditMode(true)}>
                  <FaEdit />
                  {t('izmjeni_profil')}
                </button>
                  <button className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium" onClick={openDeleteModal}>
                  <FaTrash />
                  {t('obrisi_korisnika')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title={t('obrisi_korisnika') }
          message={t('potvrda_brisanja_profila') || 'Da li ste sigurni da želite da obrišete svoj profil? Ova akcija se ne može poništiti i svi vaši podaci će biti trajno obrisani.'}
          confirmText={t('confirm') || 'Obriši'}
          cancelText={t('cancel') || 'Otkaži'}
          isDestructive={true}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}