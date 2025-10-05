'use client';
import React, { useEffect, useState } from 'react'
import {Proizvod } from '@/types';

const ProizvodPage = () => {
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);

  useEffect(() => {
    fetch('/api/proizvodi')
      .then(response => response.json())
      .then(data => {
        console.log('Proizvodi data:', data);
        setProizvodi(data.proizvodi || []);
      })
      .catch(error => {
        console.error('Error fetching proizvodi data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Proizvodi</h1>
    <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="min-w-[600px] w-full border border-violet-200 rounded-lg  text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="p-2 text-left">Naziv</th>
                        <th className="p-2 text-left">Cena</th>
                        <th className="p-2 text-left">Kategorija</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proizvodi.map(proizvod => (
                        <tr key={proizvod.id}>
                          <td className="p-2">{proizvod.naziv}</td>
                          <td className="p-2">{proizvod.cena} RSD</td>
                          <td className="p-2">{proizvod.kategorija}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
    </div>
  )
}

export default ProizvodPage;
