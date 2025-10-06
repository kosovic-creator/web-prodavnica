import { NextResponse } from 'next/server';

// Za sada ćemo simulirati WSPay/MonriPay plaćanje
// U production-u biste koristili stvarni API
export async function POST(request: Request) {
  try {
    const { amount, orderId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Neispravan iznos' }, { status: 400 });
    }

    // Simulacija WSPay/MonriPay procesa
    const orderNumber = orderId || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Za test, simuliramo uspešno plaćanje nakon kratke pauze
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/uspjesno_placanje?provider=wspay&order=${orderNumber}&amount=${amount}&status=success`;

    console.log('WSPay simulation initiated:', {
      orderNumber,
      amount,
      successUrl
    });

    // Simuliramo da korisnik ide na WSPay stranicu i vraća se sa success
    return NextResponse.json({
      success: true,
      redirectUrl: successUrl, // Za test, direktno idemo na success
      orderNumber,
      testMode: true,
      message: 'WSPay payment simulation - redirecting to success page',
      simulationNote: 'Ovo je simulacija WSPay plaćanja za test. U production-u bi korisnik bio preusmeren na pravi WSPay gateway.'
    });

  } catch (error) {
    console.error('WSPay simulation error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri WSPay simulaciji',
        details: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}
