folding sažimanje remove folding
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const flag = localStorage.getItem('porudzbinaSuccess');
  //     if (flag === '1') {
  //       toast.success('Porudžbina uspešno poslata!', { duration: 4000 });
  //       localStorage.removeItem('porudzbinaSuccess');
  //     }
  //   }
  // }, []);

localStorage.setItem('porudzbinaSuccess', '1');
a

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Proizvod {
  id: string;
  naziv: string;
  opis: string;
  karakteristike: string;
  cena: number;
  slika?: string;
  kategorija: string;
  kolicina: number;
}

export default async function ProizvodPage({ params, searchParams }: any) {
  const lang =
    typeof searchParams?.lang === 'string'
      ? searchParams.lang
      : Array.isArray(searchParams?.lang)
      ? searchParams.lang[0]
      : 'sr';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/proizvod/${params.id}?lang=${lang}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return <div>Greška pri učitavanju proizvoda.</div>;
  const proizvod: Proizvod = await res.json();

  return (
    <main>
      <h1>{proizvod.naziv}</h1>
      <p>{proizvod.opis}</p>
      <p>Cena: {proizvod.cena} RSD</p>
      {/* Dodaj ostale podatke po potrebi */}
    </main>
  );
}


TypeScript: Restart TS server
