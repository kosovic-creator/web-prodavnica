'use client';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function DiagnosticInfo() {
  const { data: session, status } = useSession();
  const { ready, i18n } = useTranslation('home');
  const [apiTest, setApiTest] = useState<string>('testing...');

  useEffect(() => {
    // Test API connectivity
    fetch('/api/proizvodi?page=1&pageSize=1')
      .then(res => res.json())
      .then(data => {
        setApiTest(`API OK: ${data.proizvodi?.length || 0} products`);
      })
      .catch(err => {
        setApiTest(`API Error: ${err.message}`);
      });
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <h3 className="font-bold mb-2">Diagnostic Info</h3>
      <div className="space-y-1">
        <div>Session Status: {status}</div>
        <div>Session Data: {session ? 'Loaded' : 'None'}</div>
        <div>User Role: {session?.user?.uloga || 'None'}</div>
        <div>Translation Ready: {ready ? 'Yes' : 'No'}</div>
        <div>Current Language: {i18n?.language || 'Unknown'}</div>
        <div>API Test: {apiTest}</div>
        <div>Environment: {process.env.NODE_ENV}</div>
      </div>
    </div>
  );
}
