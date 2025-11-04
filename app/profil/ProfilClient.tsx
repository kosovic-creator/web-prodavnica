'use client';

import { useTranslation } from 'react-i18next';
import { FaUser, FaSave, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import '@/i18n/config';
import { useState, useTransition } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { korisnikSchema } from '@/zod';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useCallback } from 'react';
import { updateProfilKorisnika, deleteKorisnik } from '@/lib/actions';
import { updatePodaciPreuzimanja, createPodaciPreuzimanja } from '@/lib/actions';

interface ProfilClientProps {
  initialKorisnik: {
    id: string;
    ime: string;
    prezime: string;
    email: string;
    uloga: string;
    podaciPreuzimanja?: {
      id: string;
      adresa: string;
      drzava: string;
      grad: string;
      postanskiBroj: number;
      telefon: string;
    } | null;
  };
  sessionUser: {
    id: string;
    ime?: string | null;
    prezime?: string | null;
    email?: string | null;
  };
}

export default function ProfilClient({ initialKorisnik, sessionUser }: ProfilClientProps) {
  const { t: tProfil } = useTranslation('profil');
  const { t: tKorisnici } = useTranslation('korisnici');
  // Helper za validaciju iz oba namespace-a
  const t = useCallback((key: string) => tKorisnici(key) !== key ? tKorisnici(key) : tProfil(key), [tKorisnici, tProfil]);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    ime: initialKorisnik.ime || '',
    prezime: initialKorisnik.prezime || '',
    email: initialKorisnik.email || '',
    telefon: initialKorisnik.podaciPreuzimanja?.telefon || '',
    drzava: initialKorisnik.podaciPreuzimanja?.drzava || '',
    grad: initialKorisnik.podaciPreuzimanja?.grad || '',
    postanskiBroj: initialKorisnik.podaciPreuzimanja?.postanskiBroj ? initialKorisnik.podaciPreuzimanja.postanskiBroj.toString() : '',
    adresa: initialKorisnik.podaciPreuzimanja?.adresa || '',
    uloga: initialKorisnik.uloga || 'korisnik',
    podaciId: initialKorisnik.podaciPreuzimanja?.id || '',
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Zod validacija
    const schema = korisnikSchema(t).omit({ lozinka: true, slika: true });
    const result = schema.safeParse(form);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) errors[String(err.path[0])] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        // Update osnovni korisnik
        const korisnikResult = await updateProfilKorisnika(sessionUser.id, {
          ime: form.ime,
          prezime: form.prezime,
          email: form.email,
          uloga: form.uloga,
        });

        if (!korisnikResult.success) {
          toast.error(korisnikResult.error || t('greska_pri_cuvanju'));
          return;
        }

        // Update ili kreiraj podatke preuzimanja
        let podaciResult;
        if (form.podaciId) {
          podaciResult = await updatePodaciPreuzimanja(sessionUser.id, {
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          });
        } else {
          podaciResult = await createPodaciPreuzimanja(sessionUser.id, {
            adresa: form.adresa,
            drzava: form.drzava,
            grad: form.grad,
            postanskiBroj: Number(form.postanskiBroj),
            telefon: form.telefon,
          });
        }

        if (!podaciResult.success) {
          toast.error(podaciResult.error || t('greska_pri_cuvanju'));
          return;
        }

        toast.success(t('korisnik_izmjenjen'));
        setEditMode(false);

        // Refresh stranice da dobijemo najnovije podatke
        router.refresh();
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error(t('greska_pri_cuvanju'));
      }
    });
  };

  const openDeleteModal = () => {
    setDeleteModal({ isOpen: true });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      try {
        const result = await deleteKorisnik(sessionUser.id);

        if (!result.success) {
          toast.error(result.error || t('greska_pri_cuvanju'));
          return;
        }

        toast.success(t('korisnik_obrisan'));
        // Redirect to home page after successful deletion
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting profile:', error);
        toast.error(t('greska_pri_cuvanju'));
      } finally {
        setIsDeleting(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
          {t('title')}
        </h1>

        {editMode ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="ime"
                    value={form.ime}
                    onChange={handleChange}
                    placeholder={t('name')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.ime && <div className="text-red-500 text-sm mt-1">{formErrors.ime}</div>}
                </div>
                <div>
                  <input
                    name="prezime"
                    value={form.prezime}
                    onChange={handleChange}
                    placeholder={t('surname')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.prezime && <div className="text-red-500 text-sm mt-1">{formErrors.prezime}</div>}
                </div>
              </div>
              <div>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('email')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.email && <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>}
              </div>
              <div>
                <input
                  name="telefon"
                  value={form.telefon}
                  onChange={handleChange}
                  placeholder={t('phone')}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                  disabled={isPending}
                />
                {formErrors.telefon && <div className="text-red-500 text-sm mt-1">{formErrors.telefon}</div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="drzava"
                    value={form.drzava}
                    onChange={handleChange}
                    placeholder={t('country')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.drzava && <div className="text-red-500 text-sm mt-1">{formErrors.drzava}</div>}
                </div>
                <div>
                  <input
                    name="grad"
                    value={form.grad}
                    onChange={handleChange}
                    placeholder={t('city')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.grad && <div className="text-red-500 text-sm mt-1">{formErrors.grad}</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    name="postanskiBroj"
                    value={form.postanskiBroj}
                    onChange={handleChange}
                    placeholder={t('postal_code')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.postanskiBroj && <div className="text-red-500 text-sm mt-1">{formErrors.postanskiBroj}</div>}
                </div>
                <div>
                  <input
                    name="adresa"
                    value={form.adresa}
                    onChange={handleChange}
                    placeholder={t('address')}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                    disabled={isPending}
                  />
                  {formErrors.adresa && <div className="text-red-500 text-sm mt-1">{formErrors.adresa}</div>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FaSave />
                  )}
                  {isPending ? 'Čuva se...' : t('sacuvaj_izmjene')}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  onClick={() => setEditMode(false)}
                  disabled={isPending}
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
                <button
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  onClick={() => setEditMode(true)}
                  disabled={isPending}
                >
                  <FaEdit />
                  {t('izmjeni_profil')}
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  onClick={openDeleteModal}
                  disabled={isPending}
                >
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
          title={t('obrisi_korisnika')}
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