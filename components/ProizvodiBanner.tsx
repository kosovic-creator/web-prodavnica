import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

interface Proizvod {
  id: string;
  naziv: string;
  cena: number;
  slika?: string;
}

export default function ProizvodiBanner() {
    const { t } = useTranslation('proizvodi');
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/proizvodi?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setProizvodi(data.proizvodi));
  }, []);

  useEffect(() => {
    if (proizvodi.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % proizvodi.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [proizvodi]);

  if (proizvodi.length === 0) return null;

  const p = proizvodi[current];

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
          <div className="flex items-center bg-gradient-to-r from-violet-700 via-violet-500 to-pink-400 text-white rounded-2xl shadow-2xl p-6 gap-6 animate-slide-in border-4 border-white/20 relative overflow-hidden">
              {/* Dekorativni krug */}
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-pink-400 opacity-30 rounded-full blur-2xl z-0"></div>
        {p.slika && (
                  <Image src={p.slika} alt={p.naziv} width={100} height={100} className="rounded-xl object-cover shadow-lg border-2 border-white/30 z-10" />
        )}
              <div className="flex-1 z-10">
                  <h2 className="text-2xl font-extrabold mb-1 drop-shadow-lg tracking-wide">{t('new_product')}: {p.naziv}</h2>
                  <div className="text-xl font-bold mb-1 drop-shadow-lg">{t('price', { price: p.cena })}</div>
        </div>
              {/* Dekorativni krug desno */}
              <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-violet-600 opacity-20 rounded-full blur-2xl z-0"></div>
      </div>
    </div>
  );
}
