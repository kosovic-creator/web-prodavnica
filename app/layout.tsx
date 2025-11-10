"use client";

import React from 'react';
import "./globals.css";
import Navbar from '@/components/Navbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { SessionProvider } from "next-auth/react";
import { KorpaProvider } from "@/components/KorpaContext";
import { Toaster } from 'react-hot-toast';
import { SearchProvider } from '@/components/SearchContext';
import { usePathname } from 'next/navigation';
import { AdminRedirector } from '@/components/AdminRedirector';
import Footer from '@/components/footer';



export default function RootLayout({
  children,
  banner,
  grid
}: {
  children: React.ReactNode;
  banner: React.ReactNode;
  grid: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isProizvodDetail = pathname?.startsWith('/proizvodi/') && pathname.split('/').length === 3;

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <html lang="sr">
      <head>
        <title>Web Trgovina 🛒</title>
        <meta name="description" content="Online trgovina - Kupite kvalitetne proizvode" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Web Trgovina" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4A90E2" />
        <meta name="msapplication-TileColor" content="#4A90E2" />
      </head>
      <body className="w-full bg-gray-50 overflow-x-hidden">
        <SessionProvider>

          <SearchProvider>
            <AdminRedirector />
            <KorpaProvider>
              <div className="min-h-screen flex flex-col">
                {/* Navbar - samo za non-admin stranice */}
                {!isAdminRoute && <Navbar setSidebarOpen={setSidebarOpen} />}

                {/* Main content area sa sidebar-om - modifikujemo */}
                <div className="flex flex-1 relative">
                  {/* Sidebar - samo za non-admin stranice */}
                  {!isAdminRoute && (
                    <Sidebar
                      open={sidebarOpen}
                      onClose={handleSidebarClose}
                    />
                  )}

                  {/* Page content - dodajemo transition i margin */}
                  <main className={`
  flex-1 transition-all duration-300 ease-in-out
  ${sidebarOpen && !isAdminRoute ? 'md:ml-0 ml-64' : 'ml-0'}
`}>
                    {isAdminRoute ? (
                      // Admin rute ne koriste parallel routes
                      <div key="layout-children">{children}</div>
                    ) : (
                      // Obične rute koriste parallel routes
                      <React.Fragment>
                        {children && <div key="layout-children">{children}</div>}
                          {/* Banner se ne prikazuje na stranici detalja proizvoda */}
                          {!isProizvodDetail && banner && <div key="layout-banner">{banner}</div>}
                        {grid && <div key="layout-grid">{grid}</div>}
                      </React.Fragment>
                    )}
                  </main>
                </div>
                {/* Footer - samo na Home stranici */}
                {/* {pathname === '/' && <Footer />} */}

                <Footer />
              </div>

              {/* Toast notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    maxWidth: '90vw',
                    fontSize: '14px',
                  },
                }}
              />
            </KorpaProvider>
          </SearchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
