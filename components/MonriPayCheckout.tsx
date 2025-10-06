'use client';

import React from 'react';

interface MonriPayButtonProps {
  amount: number;
}

const MonriPayButton: React.FC<MonriPayButtonProps> = ({ amount }) => {
  const validAmount = typeof amount === 'number' && amount > 0 ? amount : 1;
  const isDisabled = !amount || amount <= 0;

  const handleClick = async () => {
    if (isDisabled) {
      alert('Iznos za plaćanje nije validan.');
      return;
    }

    try {
      const res = await fetch('/api/monripay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: validAmount }),
      });

      const data = await res.json();

      if (data.success && data.redirectUrl) {
        // MonriPay koristi redirect na njihov payment gateway
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Greška pri kreiranju MonriPay sesije.');
      }
    } catch (error) {
      console.error('MonriPay error:', error);
      alert('Greška pri komunikaciji sa MonriPay servisom.');
    }
  };

  return (
    <button
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
      }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {/* MonriPay logo */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#fff" />
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#1E40AF" />
          <circle cx="8" cy="8" r="2" fill="#fff" />
          <circle cx="16" cy="8" r="2" fill="#fff" />
          <path d="M6 16c2 2 6 2 8 0h4c0 2-2 4-8 4s-8-2-8-4h4z" fill="#fff" />
        </svg>
        MonriPay
      </div>
    </button>
  );
};

export default MonriPayButton;
