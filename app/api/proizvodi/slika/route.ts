import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// Demo: privremena memorija za slike
const slike: { id: string; url: string }[] = [];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('slika') as File;
  const id = formData.get('id') as string;

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Fajl nije poslat' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = Date.now() + '-' + file.name.replace(/\s/g, '');
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

  await writeFile(filePath, buffer);

  const slikaUrl = `/uploads/${fileName}`;
  slike.push({ id, url: slikaUrl });

  return NextResponse.json({ success: true, slika: slikaUrl });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID nije prosleđen' }, { status: 400 });
  }
  const slika = slike.find(s => s.id === id);
  if (!slika) {
    return NextResponse.json({ error: 'Slika nije pronađena' }, { status: 404 });
  }
  return NextResponse.json({ slika: slika.url });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  const idx = slike.findIndex(s => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Slika nije pronađena' }, { status: 404 });
  }
  const filePath = path.join(process.cwd(), 'public', slike[idx].url);
  await unlink(filePath).catch(() => {});
  slike.splice(idx, 1);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('slika') as File;
  const id = formData.get('id') as string;
  if (!file || typeof file === 'string' || !id) {
    return NextResponse.json({ error: 'Podaci nisu poslati' }, { status: 400 });
  }
  // Prvo obriši staru sliku
  const idx = slike.findIndex(s => s.id === id);
  if (idx !== -1) {
    const oldPath = path.join(process.cwd(), 'public', slike[idx].url);
    await unlink(oldPath).catch(() => {});
    slike.splice(idx, 1);
  }
  // Sačuvaj novu sliku
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = Date.now() + '-' + file.name.replace(/\s/g, '');
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
  await writeFile(filePath, buffer);
  const slikaUrl = `/uploads/${fileName}`;
  slike.push({ id, url: slikaUrl });
  return NextResponse.json({ success: true, slika: slikaUrl });
}