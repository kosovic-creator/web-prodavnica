"use client";

import "./globals.css";

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { SessionProvider } from "next-auth/react";
import { KorpaProvider } from "@/components/KorpaContext";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="w-full bg-gray-50">
        <SessionProvider>
          <KorpaProvider>
            <div className="flex min-h-screen w-full">
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className="flex-1 transition-all duration-300 bg-gray-50">
                <Navbar setSidebarOpen={setSidebarOpen} />
                <div className="w-full max-w-screen-2xl mx-auto">
                  {children}
                </div>
              </div>
            </div>
            <Toaster position="top-right" />
          </KorpaProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
