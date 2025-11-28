'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { FaUsers, FaBoxOpen, FaShoppingCart, FaChevronRight, FaEuroSign, FaClock } from "react-icons/fa";
import Link from 'next/link';

export default function AdminDashboard() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, path };
  });

  // Mock stats - u realnoj aplikaciji bi ovo došlo iz API-ja
  const stats = {
    korisnici: 24,
    proizvodi: 156,
    porudzbine: 89,
    prihod: 15420
  };

  const quickActions = [
    {
      href: '/admin/korisnici',
      label: 'Upravljanje korisnicima',
      icon: FaUsers,
      color: 'blue',
      description: 'Dodaj, izmijeni ili ukloni korisnike'
    },
    {
      href: '/admin/proizvodi',
      label: 'Upravljanje proizvodima',
      icon: FaBoxOpen,
      color: 'green',
      description: 'Dodaj novi proizvod ili ažuriraj postojeće'
    },
    {
      href: '/admin/porudzbine',
      label: 'Pregled porudžbina',
      icon: FaShoppingCart,
      color: 'orange',
      description: 'Prati status porudžbina i obradi ih'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <FaChevronRight className="w-3 h-3" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.path}
                className="hover:text-blue-600 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Pregled aktivnosti i brze akcije</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-blue-600 text-sm font-medium">Korisnici</p>
              <p className="text-2xl font-bold text-blue-900">{stats.korisnici}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaBoxOpen className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-green-600 text-sm font-medium">Proizvodi</p>
              <p className="text-2xl font-bold text-green-900">{stats.proizvodi}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaShoppingCart className="text-orange-600 text-xl" />
            </div>
            <div>
              <p className="text-orange-600 text-sm font-medium">Porudžbine</p>
              <p className="text-2xl font-bold text-orange-900">{stats.porudzbine}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaEuroSign className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-purple-600 text-sm font-medium">Prihod</p>
              <p className="text-2xl font-bold text-purple-900">{stats.prihod}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Brze akcije</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <div className={`
                  p-6 rounded-lg border hover:shadow-md transition-all duration-200 bg-white
                  ${action.color === 'blue' ? 'hover:border-blue-300' : ''}
                  ${action.color === 'green' ? 'hover:border-green-300' : ''}
                  ${action.color === 'orange' ? 'hover:border-orange-300' : ''}
                `}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${action.color === 'blue' ? 'bg-blue-100' : ''}
                      ${action.color === 'green' ? 'bg-green-100' : ''}
                      ${action.color === 'orange' ? 'bg-orange-100' : ''}
                    `}>
                      <Icon className={`
                        text-lg
                        ${action.color === 'blue' ? 'text-blue-600' : ''}
                        ${action.color === 'green' ? 'text-green-600' : ''}
                        ${action.color === 'orange' ? 'text-orange-600' : ''}
                      `} />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nedavna aktivnost</h2>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center gap-3 text-gray-500">
            <FaClock className="text-lg" />
            <p>Nema nedavnih aktivnosti za prikaz</p>
          </div>
        </div>
      </div>
    </div>
  );
}