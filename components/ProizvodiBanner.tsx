import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import '@/i18n/config';
import { Proizvod } from '@/types';

const ProizvodiBannerSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
    </div>
  );
};

// Inner component that uses useSearchParams
function ProizvodiBannerContent() {
  const { t, i18n } = useTranslation('proizvodi');
  const searchParams = useSearchParams();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const currentLang = searchParams?.get('lang') || i18n.language || 'sr';
    fetch(`/api/proizvod?lang=${currentLang}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const proizvodiSaSlikama = data.filter((p: Proizvod) =>
            p.slika &&
            p.slika.trim() !== '' &&
            (p.slika.startsWith('http') || p.slika.startsWith('/'))
          );

          if (proizvodiSaSlikama.length > 0) {
            setProizvodi(proizvodiSaSlikama);
          } else {
            setProizvodi(data);
          }
        } else {
          setError(t('nema_dostupnih_proizvoda'));
        }
      })
      .catch(error => {
        console.error('Error fetching proizvodi:', error);
        setError(t('greska_ucitavanje_proizvoda'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t, i18n.language, searchParams]);

  useEffect(() => {
    if (proizvodi.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % proizvodi.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [proizvodi]);

  if (loading) {
    return (
     <ProizvodiBannerSkeleton />
    );
  }

  if (error || proizvodi.length === 0) {
    return (
      <div className="w-full h-80 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-8">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{t('dobrodosli_trgovina')}</h2>
          <p className="text-blue-100">{t('pronađite_proizvode')}</p>
        </div>
      </div>
    );
  }

  // Bez optimizacije - koristite originalnu sliku
  const currentProizvod = proizvodi[current];
  const imageUrl = currentProizvod?.slika || '';

  return (
    <div className="w-full h-80 relative overflow-hidden mb-8 rounded-lg shadow-lg bg-white">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={currentProizvod.naziv}
            fill
            className="object-contain transition-all duration-700 ease-in-out"
            priority
            quality={90}
            sizes="100vw"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              // {t('fallback_originalna_slika')}
              const target = e.target as HTMLImageElement;
              target.src = currentProizvod.slika ?? '';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />

          {/* Gradient overlay na vrhu */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent"></div>

          {/* Informacije o proizvodu */}
          <div className="absolute top-4 left-6 text-white">
            <h3 className="text-2xl font-bold drop-shadow-lg mb-1">
              {currentProizvod.naziv}
            </h3>
            {/* <p className="text-lg font-semibold text-yellow-300 drop-shadow-md">
              {currentProizvod.cena} €
            </p> */}
          </div>

          {/* Indikatori - ostaju na dnu */}
          {proizvodi.length > 1 && (
            <div className="absolute bottom-4 right-6 flex space-x-2">
              {proizvodi.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current ? 'bg-white shadow-lg' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <h3 className="text-2xl font-bold mb-2">{currentProizvod?.naziv}</h3>
            <p className="text-xl font-semibold text-blue-200">{currentProizvod?.cena} €</p>
          </div>
          </div>
      )}
    </div>
  );
}

// Main component with Suspense
export default function ProizvodiBanner() {
  return (
    <Suspense fallback={<ProizvodiBannerSkeleton />}>
      <ProizvodiBannerContent />
    </Suspense>
  );
}
