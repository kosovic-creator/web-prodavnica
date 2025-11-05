import React from 'react';
import PregledProizvodaClient from './PregledProizvodaClient';

interface PregledProizvodaPageProps {
  params: Promise<{ id: string }>;
}

export default async function PregledProizvodaPage({ params }: PregledProizvodaPageProps) {
  const { id } = await params;

  return <PregledProizvodaClient id={id} />;
}