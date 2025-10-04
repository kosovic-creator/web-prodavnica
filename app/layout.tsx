"use client";

import "./globals.css";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { SessionProvider } from "next-auth/react";
import { KorpaProvider } from "@/components/KorpaContext";
import { Toaster } from 'react-hot-toast';
import { SearchProvider } from '@/components/SearchContext';
import { FaBars } from 'react-icons/fa';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="sr">
      <head>
        <title>Web Trgovina 🛒</title>
        <meta name="description" content="Online trgovina - Kupite kvalitetne proizvode" />

        {/* Mobile-first viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />

        {/* Standard favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* iOS home screen icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Web Trgovina" />

        {/* Android icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="theme-color" content="#4A90E2" />
        <meta name="msapplication-TileColor" content="#4A90E2" />
      </head>
      <body className="w-full bg-gray-50 overflow-x-hidden">
        <SessionProvider>
          <SearchProvider>
            <KorpaProvider>
              <Navbar />
              <div className="flex min-h-screen">
                {/* Sidebar - prikazan samo kada je otvoren */}
                {sidebarOpen && (
                  <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />
                )}

                {/* Glavni sadržaj */}
                <main className="flex-1 bg-white">
                  {/* Header sa hamburger dugmetom */}
                  <header className="bg-white shadow-sm p-4 border-b">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FaBars className="w-5 h-5" />
                    </button>
                  </header>

                  {/* Sadržaj stranice */}
                  <div className="p-4">
                    {children}
                  </div>
                </main>
              </div>

              {/* Mobile-optimized Toaster */}
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
