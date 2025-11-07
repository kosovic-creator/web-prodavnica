'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deleteKorisnik } from '@/lib/actions/korisnici';

interface DeleteButtonProps {
  korisnikId: string;
  korisnikIme: string;
}

export default function DeleteButton({ korisnikId, korisnikIme }: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteModal, setDeleteModal] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteKorisnik(korisnikId);

        if (result.success) {
          toast.success(result.message || 'Korisnik je uspešno obrisan');
          setDeleteModal(false);
          router.refresh();
        } else {
          toast.error(result.error || 'Greška pri brisanju korisnika');
        }
      } catch (error) {
        console.error('Error deleting korisnik:', error);
        toast.error('Greška pri brisanju korisnika');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setDeleteModal(true)}
        className="text-red-600 hover:text-red-900 disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? 'Briše...' : 'Obriši'}
      </button>

      {/* Modal za potvrdu brisanja */}
      {deleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Potvrda brisanja</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Da li ste sigurni da želite da obrišete korisnika <strong>{korisnikIme}</strong>?
                  Ova akcija se ne može poništiti.
                </p>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isPending}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? 'Briše...' : 'Obriši'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}