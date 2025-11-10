/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Loading from '@/components/Loadning';
import { getProizvodi,deleteProizvod } from '@/lib/actions/proizvodi';

type Proizvod = {
  id: string;
  cena: number;
  slika: string | null;
  kolicina: number;
  kreiran: Date;
  naziv_sr: string | null;
  kategorija_sr: string | null;
};

const ProizvodPage = () => {
  const router = useRouter();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProizvodi = async () => {
      setLoading(true);
      try {
        const result = await getProizvodi(1, 50);
        if (result.success && result.data) {
          setProizvodi(
            result.data.proizvodi.map((p: any) => ({
              id: p.id,
              cena: p.cena,
              slika: Array.isArray(p.slike) && p.slike.length > 0 ? p.slike[0] : null,
              kolicina: p.kolicina,
              kreiran: p.kreiran,
              naziv_sr: p.naziv_sr ?? null,
              kategorija_sr: p.kategorija_sr ?? null,
            }))
          );
        } else {
          toast.error(result.error || 'Greška pri učitavanju proizvoda');
        }
      } catch (error) {
        console.error('Error fetching proizvodi data:', error);
        toast.error('Greška pri učitavanju proizvoda');
      } finally {
        setLoading(false);
      }
    };

    loadProizvodi();
  }, []);

  if (loading) {
    return <Loading />;
  }
 const handleDeleteProizvod = async (id: string) => {
    const confirmDelete = window.confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?');
    if (!confirmDelete) return;

    try {
      const result = await deleteProizvod(id);
      if (result.success) {
        toast.success('Proizvod uspešno obrisan');
        // Osveži listu proizvoda nakon brisanja
        setProizvodi((prevProizvodi) => prevProizvodi.filter((proizvod) => proizvod.id !== id));
      } else {
        toast.error(result.error || 'Greška pri brisanju proizvoda');
      }
    } catch (error) {
      console.error('Error deleting proizvod:', error);
      toast.error('Greška pri brisanju proizvoda');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorija</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Na stanju</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proizvodi.map((proizvod) => (
                <tr key={proizvod.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {proizvod.naziv_sr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {proizvod.kategorija_sr || 'Nema kategorije'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {proizvod.cena}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {proizvod.kolicina} kom
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                      onClick={() => router.push(`/admin/proizvodi/${proizvod.id}/pregled`)}
                    >
                      Detalji
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 mr-3 cursor-pointer"
                      onClick={() => router.push(`/admin/proizvodi/izmeni/${proizvod.id}`)}
                    >
                      Izmeni
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                      onClick={() => handleDeleteProizvod(proizvod.id)}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProizvodPage;
