'use client';

import React, { useEffect, useReducer, useState } from 'react';

type Stanje = {
  id: number;
  korisnik: string;
  matičniBroj: string;
  stanje: number;
  kredit: number;
  isplata: number;
  uplate: number;
};


export default function StanjeCRUD() {
  const [stanja, setStanja] = useState<Stanje[]>([]);
  const [form, setForm] = useState<Partial<Stanje>>({});
  const [editId, setEditId] = useState<number | null>(null);
 
  // Fetch all stanja
  useEffect(() => {
    fetch('/api/stanje')
      .then(async res => {
        if (!res.ok) return [];
        try {
          return await res.json();
        } catch {
          return [];
        }
      })
      .then(setStanja);
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update stanje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      // Update
      await fetch('/api/stanje', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editId }),
      });
    } else {
      // Create
      await fetch('/api/stanje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    // Refresh
    fetch('/api/stanje')
      .then(res => res.json())
      .then(setStanja);
    setForm({});
    setEditId(null);
  };

  // Delete stanje
  const handleDelete = async (id: number) => {
    await fetch('/api/stanje', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setStanja(stanja.filter(s => s.id !== id));
  };

  // Edit stanje
  const handleEdit = (s: Stanje) => {
    setForm(s);
    setEditId(s.id);
  };
 
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Stanje</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="korisnik"
          value={form.korisnik || ''}
          onChange={handleChange}
          placeholder="Korisnik"
          className="w-full px-3 py-2 border rounded"
          required
        />
         <input
          name="matičniBroj"
          value={form.matičniBroj || ''}
          onChange={handleChange}
          placeholder="Matični Broj"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          name="stanje"
          type="number"
          value={form.stanje || ''}
          onChange={handleChange}
          placeholder="Stanje"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          name="kredit"
          type="number"
          value={form.kredit || ''}
          onChange={handleChange}
          placeholder="Kredit"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="isplata"
          type="number"
          value={form.isplata || ''}
          onChange={handleChange}
          placeholder="Isplata"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          name="uplate"
          type="number"
          value={form.uplate || ''}
          onChange={handleChange}
          placeholder="Uplate"
          className="w-full px-3 py-2 border rounded"
        />
     
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {editId ? 'Izmijeni' : 'Dodaj'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setForm({}); setEditId(null); }}
            className="w-full bg-gray-300 text-gray-700 py-2 rounded mt-2"
          >
            Odustani
          </button>
        )}
      </form>

      <table className="w-full mt-8 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Korisnik</th>
            <th className="py-2 px-4">Matični Broj</th>
            <th className="py-2 px-4">Stanje</th>
            <th className="py-2 px-4">Kredit</th>
            <th className="py-2 px-4">Isplata</th>
            <th className="py-2 px-4">Uplate</th>
            <th className="py-2 px-4">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {stanja.map(s => (
            <tr key={s.id} className="border-t">
              <td className="py-2 px-4">{s.id}</td>
              <td className="py-2 px-4">{s.korisnik}</td>
              <td className="py-2 px-4">{s.matičniBroj}</td>
              <td className="py-2 px-4">{s.stanje}</td>
              <td className="py-2 px-4">{s.kredit}</td>
              <td className="py-2 px-4">{s.isplata}</td>
              <td className="py-2 px-4">{s.uplate}</td>
              <td className="py-2 px-4 flex gap-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Izmijeni
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}