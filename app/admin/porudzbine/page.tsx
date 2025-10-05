'use client';
import React, { useEffect, useState } from 'react'
import { Porudzbina } from '@/types';

const PorudzbinePage = () => {
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);

  useEffect(() => {
    fetch('/api/porudzbine')
      .then(response => response.json())
      .then(data => {
        console.log('Porudzbine data:', data);
        setPorudzbine(data.porudzbine || []);
      })
      .catch(error => {
        console.error('Error fetching porudzbine data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Porudžbine</h1>
      <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="min-w-[600px] w-full border border-violet-200 rounded-lg  text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="p-2 text-left">Korisnik</th>
                        <th className="p-2 text-left">Ukupno</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porudzbine.map(porudzbina => (
                        <tr key={porudzbina.id}>
                          <td className="p-2">{porudzbina.korisnik.ime} {porudzbina.korisnik.prezime}</td>
                          <td className="p-2">{porudzbina.ukupno} RSD</td>
                          <td className="p-2">{porudzbina.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
    </div>
  )
}

export default PorudzbinePage
