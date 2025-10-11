/* eslint-disable @typescript-eslint/no-unused-vars */
// components/OmiljeniButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Omiljeni } from '@/types';
import { toast } from 'react-hot-toast';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';


interface OmiljeniButtonProps {
  proizvodId: string;
}

export default function OmiljeniButton({ proizvodId }: OmiljeniButtonProps) {
  const { data: session } = useSession();
  const [omiljeni, setOmiljeni] = useState<Omiljeni[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('proizvodi');

  // Load omiljeni when user session changes
  useEffect(() => {
    const loadOmiljeni = async () => {
      if (!session?.user?.id) {
        setOmiljeni([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/omiljeni');
        if (response.ok) {
          const data = await response.json();
          setOmiljeni(data);

        }
      } catch (error) {
        console.error('Error loading omiljeni:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOmiljeni();
  }, [session?.user?.id, t]);

  const isProizvodOmiljeni = omiljeni.some(om => om.proizvodId === proizvodId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      // alert(t('morate_biti_prijavljeni_za_omiljene'));
      toast.error(t('morate_biti_prijavljeni_za_omiljene'), { duration: 4000 });
      return;
    }

    const isCurrentlyOmiljeni = omiljeni.some(om => om.proizvodId === proizvodId);

    try {
      if (isCurrentlyOmiljeni) {
        // Remove from favorites
        const response = await fetch(`/api/omiljeni/${proizvodId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setOmiljeni(prev => prev.filter(om => om.proizvodId !== proizvodId));
          toast.success(t('uklonjen_iz_omiljenih') || 'Uklonjen iz omiljenih', { duration: 3000 });
        } else {
          toast.error('Greška pri uklanjanju iz omiljenih', { duration: 3000 });
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/omiljeni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proizvodId })
        });
        if (response.ok) {
          // Reload favorites list
          const reloadResponse = await fetch('/api/omiljeni');
          if (reloadResponse.ok) {
            const data = await reloadResponse.json();
            setOmiljeni(data);
            toast.success(t('dodat_u_omiljene') || 'Dodato u omiljene', { duration: 3000 });
          }
        } else {
          toast.error('Greška pri dodavanju u omiljene', { duration: 3000 });
        }
      }
    } catch (error) {
      console.error('Error toggling omiljeni:', error);
      toast.error('Došlo je do greške', { duration: 3000 });
    }
  };

  if (!session?.user) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        isProizvodOmiljeni
          ? "p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
          : "p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center"
      }
      title={isProizvodOmiljeni ? t('omiljeni_ukloniti') : t('omiljeni_dodati')}
    >
      <Heart
        size={20}
        fill={isProizvodOmiljeni ? 'currentColor' : 'none'}
      />
    </button>
  );
}