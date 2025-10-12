"use client";
import { useSession } from "next-auth/react";
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
        setForm(initialState);
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
