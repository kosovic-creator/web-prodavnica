export async function fetchProizvod(id: string, lang: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/proizvodi/prevodi/${id}/${lang}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Greška pri preuzimanju proizvoda');
  return res.json();
}