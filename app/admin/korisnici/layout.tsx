'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { FaUsers, FaPlus } from "react-icons/fa";
import Link from 'next/link';

export default function KorisniciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const korisniciMenuItems = [
    {
      href: '/admin/korisnici',
      label: 'Svi korisnici',
      icon: FaUsers,
      isActive: pathname === '/admin/korisnici'
    },
    {
      href: '/admin/korisnici/dodaj',
      label: 'Dodaj korisnika',
      icon: FaPlus,
      isActive: pathname === '/admin/korisnici/dodaj'
    }
  ];

  // Modal overlay logika
  // const isDodajModal = pathname === '/admin/korisnici/dodaj';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upravljanje korisnicima</h1>
        <p className="text-gray-600">Dodaj, izmijeni ili ukloni korisnidke naloge</p>
      </div>

      {/* Sub-navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {korisniciMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${item.isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {children}
      </div>

      {/* Modal Overlay */}
      {/* {isDodajModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative min-w-[350px] max-w-full">
            {children}
            <Link
              href="/admin/korisnici"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              aria-label="Zatvori modal"
            >
              &times;
            </Link>
          </div>
        </div>
      )} */}
    </div>
  );
}