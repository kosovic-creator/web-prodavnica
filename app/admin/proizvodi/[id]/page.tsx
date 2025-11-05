import { redirect } from 'next/navigation';

interface ProizvodPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProizvodPage({ params }: ProizvodPageProps) {
  const { id } = await params;

  // Redirect to pregled by default
  redirect(`/admin/proizvodi/${id}/pregled`);
}