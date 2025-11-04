'use client';

import { useState, useTransition } from 'react';
import { dodajUKorpu } from '@/lib/actions';

interface DodajUKorpuButtonProps {
  korisnikId: string;
  proizvodId: string;
  kolicina?: number;
}

export default function DodajUKorpuButton({
  korisnikId,
  proizvodId,
  kolicina = 1
}: DodajUKorpuButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDodajUKorpu = () => {
    startTransition(async () => {
      const result = await dodajUKorpu({ korisnikId, proizvodId, kolicina });

      if (result.success) {
        setMessage({ type: 'success', text: 'Proizvod je dodat u korpu!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Greška pri dodavanju u korpu' });
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div>
      <button
        onClick={handleDodajUKorpu}
        disabled={isPending}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isPending ? 'Dodaje se...' : 'Dodaj u korpu'}
      </button>

      {message && (
        <div className={`mt-2 p-2 rounded ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}