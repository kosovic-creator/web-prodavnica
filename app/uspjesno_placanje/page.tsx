'use client';
import React, { useEffect } from 'react';
import { useKorpa } from '@/components/KorpaContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function UspjesnoPlacanjePage() {
  const { resetKorpa } = useKorpa();
  const { data: session } = useSession();
  const [cartCleared, setCartCleared] = React.useState(false);
  const router = useRouter();


  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/email/posalji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          subject: 'Potvrda plaćanja',
          text: 'Vaše plaćanje je uspješno! Hvala na kupovini.',
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Email potvrde je uspešno poslat');
          } else {
            console.log('Email nije poslat:', data.message || data.error);
          }
        })
        .catch(error => {
          console.error('Greška pri slanju email-a:', error);
        // Ne prekidamo flow - email je opciono
      });
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const korisnikId = session?.user?.id;

    const clearCart = async () => {
      if (korisnikId) {
        try {
          const response = await fetch('/api/korpa/delete-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ korisnikId }),
          });

          if (response.ok) {
            resetKorpa();
            localStorage.setItem('brojUKorpi', '0');
            window.dispatchEvent(new Event('korpaChanged'));
            console.log('Korpa je uspešno obrisana nakon Stripe plaćanja');
            setCartCleared(true);
          } else {
            console.error('Failed to clear cart:', response.statusText);
          }
        } catch (error) {
          console.error('Greška pri brisanju korpe:', error);
        }
      } else {
        resetKorpa();
        localStorage.setItem('brojUKorpi', '0');
        window.dispatchEvent(new Event('korpaChanged'));
        setCartCleared(true);
      }
    };

    // Pozovi samo jednom kada se komponenta mount-uje ili se session promeni
    if (session !== undefined && !cartCleared) {
      clearCart();
      setCartCleared(true);
    }
  }, [session, cartCleared, resetKorpa]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="p-8 text-center">
      <h1>Uspješno plaćanje!</h1>
      <p>Potvrda je poslana na vaš email.</p>
      <p>Hvala na kupovini!</p>
    </div>
  );
}