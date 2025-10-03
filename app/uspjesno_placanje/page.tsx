'use client';
import React, { useEffect, useState } from 'react';
import { useKorpa } from '@/components/KorpaContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UspjesnoPlacanjePage() {
  const { stavke, resetKorpa } = useKorpa();
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    if (isProcessed) return;

    const processPaymentSuccess = async () => {
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
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Uspješno plaćanje!</h1>
      <p className="mb-2">Potvrda je poslana na vaš email.</p>
      <p className="mb-4">Hvala na kupovini!</p>
      <p className="text-sm text-gray-600">
        Bićete preusmjereni na početnu stranicu za 5 sekundi...
      </p>
    </div>
  );
}