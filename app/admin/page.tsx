'use client';

import { Suspense } from 'react';
import AdminHomeClient from '@/components/AdminHomeClient';

export default function AdminHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminHomeClient />
    </Suspense>
  );
}
