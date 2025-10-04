/* eslint-disable @typescript-eslint/no-unused-vars */
// components/OmiljeniButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Omiljeni } from '@/types';
import { toast } from 'react-hot-toast';


interface OmiljeniButtonProps {
  proizvodId: string;
}

export default function OmiljeniButton({ proizvodId }: OmiljeniButtonProps) {
  const { data: session } = useSession();
  const [omiljeni, setOmiljeni] = useState<Omiljeni[]>([]);
  const [loading, setLoading] = useState(false);

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
          // toast.success('Omiljeni proizvodi učitani');
        }
      } catch (error) {
        console.error('Error loading omiljeni:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOmiljeni();
  }, [session?.user?.id]);

  const isProizvodOmiljeni = omiljeni.some(om => om.proizvodId === proizvodId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      alert('Morate biti ulogirani za dodavanje u omiljene');
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
          }
        }
      }
    } catch (error) {
      console.error('Error toggling omiljeni:', error);
    }
  };

  if (!session?.user) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        isProizvodOmiljeni
          ? "p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors disabled:opacity-50"
          : "p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400 transition-colors disabled:opacity-50"
      }
      title={isProizvodOmiljeni ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
    >
      <Heart
        size={20}
        fill={isProizvodOmiljeni ? 'currentColor' : 'none'}
      />
    </button>
  );
}