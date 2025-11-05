import React from 'react';
import HistorijaProizvodaClient from './HistorijaProizvodaClient';

interface HistorijaProizvodaPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistorijaProizvodaPage({ params }: HistorijaProizvodaPageProps) {
  const { id } = await params;

  return <HistorijaProizvodaClient id={id} />;
}