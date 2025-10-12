/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import { useKorpa } from '@/components/KorpaContext';
import { useSession } from 'next-auth/react';
export default function UspjesnoPlacanjePage() {
  const { stavke, resetKorpa } = useKorpa();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState<'monripay' | 'unknown'>('unknown');
  const [emailError, setEmailError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Detekcija providera
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('provider') === 'monripay' || urlParams.get('ShoppingCartID') || urlParams.get('Success')) {
      setPaymentProvider('monripay');
      console.log('MonriPay payment detected');
    } else {
      setPaymentProvider('unknown');
      console.log('Unknown payment provider');
    }

    // Proces plaćanja
    const processPaymentSuccess = async () => {
      console.log('Pokretam obradu uspješnog plaćanja...');
      console.log('Stavke u korpi:', stavke);

      // 1. Umanji stanje proizvoda u bazi
      try {
        if (stavke && stavke.length > 0) {
          for (const item of stavke) {
            await fetch('/api/proizvodi/update-stanje', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ proizvodId: item.proizvodId, kolicina: item.kolicina }),
            });
          }
        }
      } catch (error) {
        console.error('Greška pri obradi plaćanja:', error);
      }

      // 2. Prazni korpu u bazi
      if (session?.user?.id) {
        try {
          await fetch('/api/korpa/delete-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ korisnikId: session.user.id }),
          });
          console.log('Backend korpa je obrisana');
        } catch (error) {
          console.error('Greška pri brisanju korpe u bazi:', error);
        }
      }
      // 3. Resetuj korpu na frontendu
      resetKorpa();

      // 3. Pošalji email potvrdu
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

      setIsLoading(false);
    };
    processPaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Obrađujem plaćanje...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Plaćanje uspješno!</h1>
            <p className="text-gray-600 mb-4">Vaša porudžbina je obrađena. Hvala na kupovini!</p>
            {paymentProvider === 'monripay' && (
              <p className="text-green-600">MonriPay transakcija je uspješno završena.</p>
            )}
            {paymentProvider === 'unknown' && (
              <p className="text-yellow-600">Transakcija je završena, ali nije prepoznat provider.</p>
            )}
            {emailError && (
              <p className="text-red-600 mt-4">{emailError}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
