"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';

const initialState = {
  adresa: '',
  drzava: '',
  grad: '',
  postanskiBroj: '',
  telefon: '',
};

export default function PodaciPreuzimanjaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (!session?.user?.id) {
        setMessage('Niste prijavljeni.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/podaci-preuzimanja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          postanskiBroj: Number(form.postanskiBroj),
          korisnikId: session.user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Podaci su uspešno sačuvani!');
        // Slanje emaila korisniku
        await fetch('/api/email/posalji', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session?.user?.email,
            subject: 'Podaci za preuzimanje su sačuvani',
            html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:24px;background:#fafcff;">
              <h2 style="color:#2d7ef7;text-align:center;margin-bottom:16px;">✅ Vaši podaci za preuzimanje su uspešno sačuvani!</h2>
              <table style="width:100%;font-size:16px;line-height:1.7;">
                <tr><td style="font-weight:bold;width:120px;">Ime:</td><td>${session.user.ime}</td></tr>
                <tr><td style="font-weight:bold;">Prezime:</td><td>${session.user.prezime}</td></tr>
                <tr><td style="font-weight:bold;">Adresa:</td><td>${form.adresa}</td></tr>
                <tr><td style="font-weight:bold;">Grad:</td><td>${form.grad}</td></tr>
                <tr><td style="font-weight:bold;">Država:</td><td>${form.drzava}</td></tr>
                <tr><td style="font-weight:bold;">Telefon:</td><td>${form.telefon}</td></tr>
              </table>
              <hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0;" />
              <div style="text-align:center;color:#888;font-size:13px;">Hvala na povjerenju!<br>Web prodavnica</div>
            </div>`,
          }),
        });
        router.push('/');
      } else {
        setMessage(data.error || 'Greška pri unosu.');
      }
    } catch {
      setMessage('Greška pri unosu.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Podaci za preuzimanje</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="adresa" value={form.adresa} onChange={handleChange} placeholder="Adresa" className="w-full p-2 border rounded" required />
        <input name="drzava" value={form.drzava} onChange={handleChange} placeholder="Država" className="w-full p-2 border rounded" required />
        <input name="grad" value={form.grad} onChange={handleChange} placeholder="Grad" className="w-full p-2 border rounded" required />
        <input name="postanskiBroj" value={form.postanskiBroj} onChange={handleChange} placeholder="Poštanski broj" className="w-full p-2 border rounded" required />
        <input name="telefon" value={form.telefon} onChange={handleChange} placeholder="Telefon" className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Sačuvaj...' : 'Sačuvaj'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}
