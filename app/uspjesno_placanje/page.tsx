/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useEffect } from 'react';
import { useKorpa } from '@/components/KorpaContext';
import { useSession } from 'next-auth/react';

export default function UspjesnoPlacanjePage() {
  const { resetKorpa } = useKorpa();
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/email/posalji', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session?.user?.email || 'drasko.kosovic@gmail.com',
        subject: 'Potvrda plaćanja',
        text: 'Vaše plaćanje je uspješno! Hvala na kupovini.',
      }),
    });
  }, [session, resetKorpa]);

  useEffect(() => {
    const korisnikId = session?.user?.id;
    if (korisnikId) {
      fetch('/api/korpa/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnikId }),
      }).then(() => {
        resetKorpa();
        localStorage.setItem('brojUKorpi', '0');
        window.dispatchEvent(new Event('korpaChanged'));
      });
    } else {
      resetKorpa();
      localStorage.setItem('brojUKorpi', '0');
      window.dispatchEvent(new Event('korpaChanged'));
    }
  }, [session]);

  return (
    <div className="p-8 text-center">
      <h1>Uspješno plaćanje!</h1>
      <p>Potvrda je poslana na vaš email.</p>
      <div>
        <h2>Plaćanje uspješno!</h2>
        <p>Vaša korpa je sada prazna.</p>
      </div>
    </div>
  );
}