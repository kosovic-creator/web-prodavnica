import React from 'react';
import StatistikeProizvodaClient from './StatistikeProizvodaClient';

interface StatistikeProizvodaPageProps {
  params: Promise<{ id: string }>;
}

export default async function StatistikeProizvodaPage({ params }: StatistikeProizvodaPageProps) {
  const { id } = await params;

  return <StatistikeProizvodaClient id={id} />;
}