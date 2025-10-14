'use client';
import React from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaUserShield, FaUsers, FaBoxOpen, FaShoppingCart } from "react-icons/fa";
import Link from 'next/link';

function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admin users to home
    if (status !== 'loading' && session?.user?.uloga !== 'admin') {
      router.push('/');
    }
  }, [session?.user?.uloga, status, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="p-8 animate-pulse">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-200 rounded"></div>
          <div className="w-40 h-8 bg-blue-100 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (session?.user?.uloga !== 'admin') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-blue-700 mb-2">
          <FaUserShield className="text-blue-600" />
          Admin Panel
        </h1>
        <p className="text-gray-600">Dobrodošli, {session?.user?.ime || session?.user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Korisnici */}
        <Link href="/admin/korisnici" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group-hover:border-blue-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Korisnici</h2>
            </div>
            <p className="text-gray-600">Upravljanje korisničkim nalozima</p>
          </div>
        </Link>

        {/* Proizvodi */}
        <Link href="/admin/proizvodi" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group-hover:border-green-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaBoxOpen className="text-green-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Proizvodi</h2>
            </div>
            <p className="text-gray-600">Upravljanje proizvodima i inventarom</p>
          </div>
        </Link>

        {/* Porudžbine */}
        <Link href="/admin/porudzbine" className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group-hover:border-orange-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="text-orange-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Porudžbine</h2>
            </div>
            <p className="text-gray-600">Praćenje porudžbinama</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
