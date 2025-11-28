'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBoxes, FaPlus, FaEye, FaChevronRight } from 'react-icons/fa';

interface ProizvodiLayoutProps {
  children: React.ReactNode;
}

export default function ProizvodiLayout({ children }: ProizvodiLayoutProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Custom labels for specific segments
    if (segment === 'admin') label = 'Admin';
    if (segment === 'proizvodi') label = 'Proizvodi';
    if (segment === 'dodaj') label = 'Dodaj proizvod';
    if (segment === 'izmeni') label = 'Izmeni';
    if (segment.length === 36) label = 'Proizvod'; // UUID format

    return { label, path };
  });

  // Navigation items
  const navItems = [
    {
      href: '/admin/proizvodi',
      label: 'Svi proizvodi',
      icon: FaBoxes,
      isActive: pathname === '/admin/proizvodi'
    },
    {
      href: '/admin/proizvodi/dodaj',
      label: 'Dodaj proizvod',
      icon: FaPlus,
      isActive: pathname === '/admin/proizvodi/dodaj'
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

      {/* Section Header with Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaBoxes className="text-blue-600" />
              Upravljanje proizvodima
            </h1>
            <p className="text-gray-600 mt-1">
              {pathname === '/admin/proizvodi' && 'Pregled i upravljanje inventarom proizvoda'}
              {pathname === '/admin/proizvodi/dodaj' && 'Dodaj novi proizvod u inventar'}
              {pathname.includes('/izmeni/') && 'Izmijeni postojeći proizvod'}
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${item.isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Additional actions based on current page */}
            {pathname.includes('/izmeni/') && (
              <Link
                href={`/admin/proizvodi/${pathname.split('/').pop()}/pregled`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
              >
                <FaEye className="w-4 h-4" />
                Pregled
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}