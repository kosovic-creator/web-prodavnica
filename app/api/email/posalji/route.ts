import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, subject, text } = await request.json();

    if (!email || !subject || !text) {
      return NextResponse.json({
        error: 'Email, subject i text su obavezni'
      }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email konfiguracija nije postavljena');
      return NextResponse.json({
        success: false,
        message: 'Email servis nije konfigurisan'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });

    return NextResponse.json({
      success: true,
      message: 'Email uspešno poslat'
    });

  } catch (error) {
    console.error('Greška pri slanju email-a:', error);

    return NextResponse.json({
      success: false,
      error: 'Greška pri slanju email-a',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}