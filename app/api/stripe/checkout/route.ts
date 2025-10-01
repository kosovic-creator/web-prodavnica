import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: Request) {
  try {
    const { amount, naziv = 'Proizvod iz korpe', quantity = 1 } = await request.json();
    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Neispravan iznos' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: naziv,
          },
          unit_amount: Math.round(amount * 100), // amount u eur, Stripe traži u centima
        },
        quantity,
      }],
      mode: 'payment',
      success_url: process.env.uspjesno_placanje_url || 'https://localhost:3000/uspjesno_placanje',
      cancel_url: process.env.cancel_url || 'https://localhost:3000/cancel',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}