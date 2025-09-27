'use client';

import dynamic from 'next/dynamic';

const AdminHomeClient = dynamic(() => import('./AdminHomeClient'), {
  ssr: false,
});

export default function AdminHome() {
  return <AdminHomeClient />;
}
