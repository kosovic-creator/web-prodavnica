import ProizvodLayoutClient from './ProizvodLayoutClient';

interface ProizvodLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProizvodLayout({ children, params }: ProizvodLayoutProps) {
  const { id } = await params;

  return (
    <ProizvodLayoutClient id={id}>
      {children}
    </ProizvodLayoutClient>
  );
}