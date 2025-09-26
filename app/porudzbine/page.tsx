'use client';
import { useState, useEffect, useCallback } from 'react';
import { Porudzbina } from '@/types';
import { useTranslation } from 'react-i18next';
import { FaClipboardList, FaUser, FaTrash, FaEdit } from "react-icons/fa";
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import '@/i18n/config';
import toast, { Toaster } from 'react-hot-toast';

export default function PorudzbinePage() {
  const { t } = useTranslation('porudzbine');
  const { data: session } = useSession();
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ korisnikId: '', ukupno: '', status: '', email: '' });
  const [editId, setEditId] = useState<string | null>(null);

  // Zod shema sa lokalizovanim porukama
  const schema = z.object({
    korisnikId: z.string().min(1, { message: t('required') }),
    ukupno: z.string().min(1, { message: t('required') }),
    status: z.string().min(1, { message: t('required') }),
    email: z.string().email({ message: t('invalid_email') }).optional().or(z.literal('')),
  });

  const fetchPorudzbine = useCallback(() => {
    fetch(`/api/porudzbine?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine);
        setTotal(data.total);
      });
  }, [page, pageSize]);

  useEffect(() => {
    fetchPorudzbine();
  }, [fetchPorudzbine]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validacija forme sa lokalizovanim porukama
  const validateForm = () => {
    setFieldErrors({});
    const result = schema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { id: editId, ...form, ukupno: Number(form.ukupno) } : { ...form, ukupno: Number(form.ukupno) };
    const res = await fetch('/api/porudzbine', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ? t(data.error) : t('error'));
    } else {
      toast.success(editId ? t('success_update') : t('success_create'));
      setForm({ korisnikId: '', ukupno: '', status: '', email: '' });
      setEditId(null);
      fetchPorudzbine();
    }
  };

  const handleEdit = (p: Porudzbina) => {
    setEditId(p.id);
    setForm({
      korisnikId: p.korisnikId,
      ukupno: String(p.ukupno),
      status: p.status,
      email: p.email || '',
    });
    setFieldErrors({});

  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/porudzbine', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ? t(data.error) : t('error'));
    } else {
      toast.success(t('success_delete'));
      fetchPorudzbine();
    }
  };



  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-2 text-red-600 mt-8">
        <div className="flex items-center gap-2">
          <FaUser />
          <span>{t('must_login')}</span>
        </div>
        <a href="/auth/prijava" className="text-blue-600 underline mt-2">{t('login')}</a>
      </div>
    );
  }
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />

 <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaClipboardList className="text-violet-600" />
        {t('title')}
      </h1>
      {/* Forma za dodavanje/izmenu */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap">
        <div>
          <input
            name="korisnikId"
            value={form.korisnikId}
            onChange={handleChange}
            placeholder="Korisnik ID"
            className={`border p-2 rounded ${fieldErrors.korisnikId ? 'border-red-500' : ''}`}
          />
          {fieldErrors.korisnikId && (
            <div className="text-red-600 text-xs mt-1">{fieldErrors.korisnikId}</div>
          )}
        </div>
        <div>
          <input
            name="ukupno"
            value={form.ukupno}
            onChange={handleChange}
            placeholder={t('total')}
            type="number"
            className={`border p-2 rounded ${fieldErrors.ukupno ? 'border-red-500' : ''}`}
          />
          {fieldErrors.ukupno && (
            <div className="text-red-600 text-xs mt-1">{fieldErrors.ukupno}</div>
          )}
        </div>
        <div>
          <input
            name="status"
            value={form.status}
            onChange={handleChange}
            placeholder={t('status')}
            className={`border p-2 rounded ${fieldErrors.status ? 'border-red-500' : ''}`}
          />
          {fieldErrors.status && (
            <div className="text-red-600 text-xs mt-1">{fieldErrors.status}</div>
          )}
        </div>
        <div>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`border p-2 rounded ${fieldErrors.email ? 'border-red-500' : ''}`}
          />
          {fieldErrors.email && (
            <div className="text-red-600 text-xs mt-1">{fieldErrors.email}</div>
          )}
        </div>
        <button type="submit" className="bg-violet-600 text-white px-3 py-1 rounded shadow hover:bg-violet-700 transition">
          {t('update') }
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ korisnikId: '', ukupno: '', status: '', email: '' }); }} className="bg-gray-300 px-3 py-1 rounded">
            {t('cancel')}
          </button>
        )}
      </form>
      {/* Prikaz poruka */}
      {/* {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>} */}
      {/* Tabela */}
      <table className="w-full border border-gray-300 mb-4 rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700">
            <th className="p-4 text-left border-b border-gray-300">{t('status')}</th>
            <th className="p-4 text-left border-b border-gray-300">{t('total')}</th>
            <th className="p-4 text-left border-b border-gray-300">{t('date')}</th>
            <th className="p-4 text-left border-b border-gray-300"></th>
          </tr>
        </thead>
        <tbody>
          {porudzbine.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 p-6 border-b border-gray-300">{t('empty')}</td>
            </tr>
          ) : (
            porudzbine.map((p: Porudzbina) => (
              <tr key={p.id} className="hover:bg-violet-50 transition border-b border-gray-300">
                <td className="p-4 text-left border-b border-gray-300">{p.status}</td>
                <td className="p-4 text-left border-b border-gray-300">{p.ukupno} €</td>
                <td className="p-4 text-left border-b border-gray-300">{new Date(p.kreiran).toLocaleDateString()}</td>
                <td className="p-4 text-left border-b border-gray-300 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600"><FaEdit /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600"><FaTrash /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Paginacija */}
      {total > 10 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >
            {t('prethodna')}
          </button>
          <span>
            {page} / {Math.ceil(total / pageSize)}
          </span>
          <button
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage(page + 1)}
            className={`px-3 py-1 rounded ${page >= Math.ceil(total / pageSize) ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >
            {t('sljedeca')}
          </button>
        </div>
   )}
    </div>
    </>


  );
}