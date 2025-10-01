"use client";

import "./globals.css";

import Navbar from '../components/Navbar'; // Direktno koristimo Navbar
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { SessionProvider } from "next-auth/react";
import { KorpaProvider } from "@/components/KorpaContext";
import { Toaster } from 'react-hot-toast';
import { SearchProvider } from '@/components/SearchContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
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
              <div className="flex min-h-screen w-full relative">
                {/* Sidebar - sa unutrašnjim Suspense */}
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Mobile Overlay */}
                {sidebarOpen && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 bg-gray-50 min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'
                  }`}>
                  <div className="sticky top-0 z-30">
                    <Navbar setSidebarOpen={setSidebarOpen} />
                  </div>
                  <main className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
                    {children}
                  </main>
                </div>
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
