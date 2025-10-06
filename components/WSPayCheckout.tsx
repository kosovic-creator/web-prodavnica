'use client';

import React from 'react';

interface WSPayButtonProps {
  amount: number;
}

const WSPayButton: React.FC<WSPayButtonProps> = ({ amount }) => {
  const validAmount = typeof amount === 'number' && amount > 0 ? amount : 1;
  const isDisabled = !amount || amount <= 0;

  const handleClick = async () => {
    if (isDisabled) {
      alert('Iznos za plaćanje nije validan.');
      return;
    }

    try {
      const res = await fetch('/api/wspay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: validAmount }),
      });

      const data = await res.json();

      if (data.success && data.redirectUrl) {
        // WSPay koristi redirect na njihov payment gateway
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Greška pri kreiranju WSPay sesije.');
      }
    } catch (error) {
      console.error('WSPay error:', error);
      alert('Greška pri komunikaciji sa WSPay servisom.');
    }
  };

  return (
    <button
      className={`w-full flex items-center justify-center gap-2 py-2 rounded font-bold mb-2 ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
      }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {/* WSPay logo SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#fff" />
        <rect x="2" y="2" width="28" height="28" rx="4" fill="#1E40AF" />
        <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">WSPay</text>
      </svg>
      WSPay (Crna Gora)
    </button>
  );
};

export default WSPayButton;
