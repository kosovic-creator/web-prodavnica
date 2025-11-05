'use client';

import React, { useState, useTransition } from 'react';
import { FaSave, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { createKorisnik } from '@/lib/actions/korisnici';
import toast from 'react-hot-toast';

export default function DodajKorisnikaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    lozinka: '',
    ime: '',
    prezime: '',
    uloga: 'korisnik',
    adresa: '',
    drzava: '',
    grad: '',
    telefon: '',
    postanskiBroj: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const dataToSubmit = {
          ...formData,
          postanskiBroj: parseInt(formData.postanskiBroj) || 0
        };

        const result = await createKorisnik(dataToSubmit);

        if (result.success) {
          toast.success('Korisnik je uspješno kreiran!');
          router.push('/admin/korisnici');
        } else {
          toast.error(result.error || 'Greška pri kreiranju korisnika');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        toast.error('Došlo je do greške pri kreiranju korisnika');
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dodaj novog korisnika</h2>
        <p className="text-gray-600 mt-1">Unesite podatke za novi korisnički nalog</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white border rounded-lg p-6">
          {/* Osnovne informacije */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Osnovne informacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1">
                  Ime *
                </label>
                <input
                  type="text"
                  id="ime"
                  name="ime"
                  required
                  value={formData.ime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="prezime" className="block text-sm font-medium text-gray-700 mb-1">
                  Prezime *
                </label>
                <input
                  type="text"
                  id="prezime"
                  name="prezime"
                  required
                  value={formData.prezime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="lozinka" className="block text-sm font-medium text-gray-700 mb-1">
                  Lozinka *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="lozinka"
                    name="lozinka"
                    required
                    value={formData.lozinka}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="uloga" className="block text-sm font-medium text-gray-700 mb-1">
                  Uloga
                </label>
                <select
                  id="uloga"
                  name="uloga"
                  value={formData.uloga}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="korisnik">Korisnik</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Adresa */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Podaci za preuzimanje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="adresa" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresa *
                </label>
                <input
                  type="text"
                  id="adresa"
                  name="adresa"
                  required
                  value={formData.adresa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="grad" className="block text-sm font-medium text-gray-700 mb-1">
                  Grad *
                </label>
                <input
                  type="text"
                  id="grad"
                  name="grad"
                  required
                  value={formData.grad}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="postanskiBroj" className="block text-sm font-medium text-gray-700 mb-1">
                  Poštanski broj *
                </label>
                <input
                  type="number"
                  id="postanskiBroj"
                  name="postanskiBroj"
                  required
                  value={formData.postanskiBroj}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="drzava" className="block text-sm font-medium text-gray-700 mb-1">
                  Država
                </label>
                <input
                  type="text"
                  id="drzava"
                  name="drzava"
                  value={formData.drzava}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {isPending ? 'Kreiram...' : 'Kreiraj korisnika'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
              Otkaži
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}