'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useKorpa } from '@/components/KorpaContext';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function UspjesnoPageContent() {
  const { stavke, resetKorpa } = useKorpa();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessed, setIsProcessed] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'monripay' | 'unknown'>('unknown');

  useEffect(() => {
    if (isProcessed) return;

    // Detecting payment provider from URL parameters
    const detectPaymentProvider = () => {
      const urlParams = new URLSearchParams(window.location.search);

      // MonriPay parametri
      if (urlParams.get('provider') === 'monripay' || urlParams.get('ShoppingCartID') || urlParams.get('Success')) {
        setPaymentProvider('monripay');
        console.log('MonriPay payment detected');
      } else {
        setPaymentProvider('unknown');
        console.log('Unknown payment provider');
      }
    };

    const processPaymentSuccess = async () => {
      detectPaymentProvider();
      console.log('Pokretam obradu uspešnog plaćanja...');
      console.log('Stavke u korpi:', stavke);

      // 1. Umanji stanje proizvoda u bazi
      try {
        if (stavke && stavke.length > 0) {
          console.log('Ažuriram stanje za stavke:', stavke);

          for (const item of stavke) {
            console.log(`Ažuriram stanje za proizvod ${item.proizvodId}, količina: ${item.kolicina}`);

            const response = await fetch('/api/proizvodi/update-stanje', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                proizvodId: item.proizvodId,
                kolicina: item.kolicina
              }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
              console.error(`Greška pri ažuriranju stanja za proizvod ${item.proizvodId}:`, responseData);
            } else {
              console.log(`Stanje uspešno ažurirano za proizvod ${item.proizvodId}:`, responseData);
            }
          }
          console.log('Stanje svih proizvoda je uspešno ažurirano');
        } else {
          console.log('Nema stavki u korpi za ažuriranje stanja');
        }
      } catch (error) {
        console.error('Greška pri ažuriranju stanja proizvoda:', error);
      }

    // 2. Email potvrda
      if (session?.user?.email) {
        try {
          await fetch('/api/email/posalji', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              subject: 'Potvrda plaćanja',
              text: 'Vaše plaćanje je uspješno! Hvala na kupovini.',
            }),
          });
          console.log('Email potvrde je poslat');
        } catch (error) {
          console.error('Greška pri slanju email-a:', error);
        }
      }

      // 3. Obriši korpu iz baze
      const korisnikId = session?.user?.id;
      if (korisnikId) {
        try {
          const response = await fetch('/api/korpa/delete-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ korisnikId }),
          });

          if (response.ok) {
            console.log('Korpa je obrisana iz baze');
          }
        } catch (error) {
          console.error('Greška pri brisanju korpe:', error);
        }
      }

      // 4. Resetuj lokalnu korpu
      resetKorpa();
      localStorage.setItem('brojUKorpi', '0');
      window.dispatchEvent(new Event('korpaChanged'));

      console.log('Lokalna korpa je obrisana');
      setIsProcessed(true);
    };

    // Pokreni kada su session i stavke učitani
    if (session !== undefined && stavke !== undefined) {
      processPaymentSuccess();
    }
  }, [session, isProcessed, stavke, resetKorpa]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Plaćanje uspešno!</h1>
        <p className="text-gray-600 mb-4">Vaša porudžbina je uspešno procesovana.</p>

        {/* Payment Provider Info */}
        {paymentProvider !== 'unknown' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              {paymentProvider === 'monripay' && (
                <>
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs text-white font-bold">M</span>
                  </div>
                  <span className="text-sm text-gray-700">Plaćeno putem MonriPay-a</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-600">✓ Potvrda je poslana na vaš email</p>
          <p className="text-sm text-gray-600">✓ Stanje proizvoda je ažurirano</p>
          <p className="text-sm text-gray-600">✓ Korpa je ispražnjena</p>
        </div>

        {/* Redirect Info */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-2">
            Hvala vam na kupovini!
          </p>
          <p className="text-xs text-gray-400">
            Bićete preusmjereni na početnu stranicu za 5 sekundi...
          </p>
        </div>

        {/* Manual Navigation Button */}
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Vrati se na početnu stranicu
        </button>
      </div>
    </div>
  );
}

export default function UspjesnoPlacanjePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Učitavam...</p>
      </div>
    </div>}>
      <UspjesnoPageContent />
    </Suspense>
  );
}