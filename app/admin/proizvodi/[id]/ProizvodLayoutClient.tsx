'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaEye, FaHistory, FaChartLine } from 'react-icons/fa';

interface ProizvodLayoutClientProps {
  children: React.ReactNode;
  id: string;
}

export default function ProizvodLayoutClient({ children, id }: ProizvodLayoutClientProps) {
  const pathname = usePathname();

  // Navigation tabs for individual product
  const tabs = [
    {
      href: `/admin/proizvodi/${id}/pregled`,
      label: 'Pregled',
      icon: FaEye,
      isActive: pathname.includes('/pregled')
    },
    {
      href: `/admin/proizvodi/izmeni/${id}`,
      label: 'Izmeni',
      icon: FaEdit,
      isActive: pathname.includes('/izmeni')
    },
    {
      href: `/admin/proizvodi/${id}/historija`,
      label: 'Historija',
      icon: FaHistory,
      isActive: pathname.includes('/historija')
    },
    {
      href: `/admin/proizvodi/${id}/statistike`,
      label: 'Statistike',
      icon: FaChartLine,
      isActive: pathname.includes('/statistike')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Product Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all
                    ${tab.isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}