import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

interface Proizvod {
  id: string;
  naziv: string;
  cena: number;
  slika?: string;
  opis?: string;
  kolicina: number;
}

export default function ProizvodiList() {
  const { t } = useTranslation('proizvodi');
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Proizvod | null>(null);

  useEffect(() => {
    fetch('/api/proizvodi?page=1&pageSize=1000')
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-8">{t('loading')}</div>;
  if (proizvodi.length === 0) return <div className="text-center py-8">{t('empty')}</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full mt-8">
        {proizvodi.map(p => (
          <div
            key={p.id}
            className="border rounded-xl shadow-lg p-4 flex flex-col items-center bg-white hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setSelected(p)}
          >
            {p.slika && (
              <Image src={p.slika} alt={p.naziv} width={140} height={140} className="mb-2 rounded-lg object-cover" />
            )}
            <h2 className="font-bold text-lg mb-1 text-center">{p.naziv}</h2>
            <div className="text-violet-700 font-semibold mb-2 text-lg">{t('price', { price: p.cena })}</div>
            {p.opis && <div className="text-gray-500 text-sm mb-2 text-center line-clamp-2">{p.opis}</div>}
            <div className={`mb-2 font-semibold ${p.kolicina === 0 ? 'text-red-600' : 'text-gray-700'}`}>Količina: {p.kolicina}</div>
            {p.kolicina === 0 && (
              <div className="text-red-600 text-sm font-bold mb-2">Nema na zalihama</div>
            )}
            <button className="mt-auto px-4 py-2 bg-violet-600 text-white rounded-lg shadow hover:bg-violet-700 transition">{t('details')}</button>
          </div>
        ))}
      </div>
      {/* Modal za detalje proizvoda */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-violet-700 text-2xl"
              onClick={() => setSelected(null)}
                          aria-label={t('close')}
            >
              &times;
            </button>
            {selected.slika && (
              <Image src={selected.slika} alt={selected.naziv} width={180} height={180} className="mb-4 rounded-lg object-cover mx-auto" />
            )}
            <h2 className="font-bold text-2xl mb-2 text-center">{selected.naziv}</h2>
            <div className="text-violet-700 font-semibold mb-2 text-xl text-center">{t('price', { price: selected.cena })}</div>
            {selected.opis && <div className="text-gray-700 text-base mb-4 text-center">{selected.opis}</div>}
            <div className={`mb-2 font-semibold text-center ${selected.kolicina === 0 ? 'text-red-600' : 'text-gray-700'}`}>Količina: {selected.kolicina}</div>
            {selected.kolicina === 0 && (
              <div className="text-red-600 text-sm font-bold mb-2 text-center">Nema na zalihama</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
