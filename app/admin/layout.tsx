'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Učitavam...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.uloga !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pristup odbijen</h1>
          <p className="text-gray-600">Potrebne su admin privilegije za pristup ovoj stranici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar session={session} />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}