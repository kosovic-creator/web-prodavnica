'use client'
import React, { useEffect, useState } from 'react'
import { Korisnik } from '@/types';


const KorisniciPage = () => {
 const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
    useEffect(() => {
       fetch('/api/korisnici')
         .then(response => response.json())
         .then(data => {
           console.log('Korisnici data:', data);
           setKorisnici(data.korisnici || []);
         })
         .catch(error => {
           console.error('Error fetching korisnici data:', error);
         });
    }, []);


    return (
        <>
           <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="min-w-[600px] w-full border border-violet-200 rounded-lg  text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Ime</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Uloga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {korisnici.map(korisnik => (
                        <tr key={korisnik.id} className="border-b">
                          <td className="p-2">{korisnik.id}</td>
                          <td className="p-2">{korisnik.ime}</td>
                          <td className="p-2">{korisnik.email}</td>
                          <td className="p-2">{korisnik.uloga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
        </>
    )
}

export default KorisniciPage