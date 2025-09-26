'use client';

import React from 'react';

interface StripeButtonProps {
  amount: number;
}

const StripeButton: React.FC<StripeButtonProps> = ({ amount }) => {
  const validAmount = typeof amount === 'number' && amount > 0 ? amount : 1;
  const isDisabled = !amount || amount <= 0;
  const handleClick = async () => {
    if (isDisabled) {
      alert('Iznos za plaćanje nije validan.');
      return;
    }
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: validAmount }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Greška pri kreiranju Stripe sesije.');
    }
  };

  return (
    <button
      className={`w-full flex items-center justify-center gap-2 py-2 rounded font-bold mb-2 ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {/* Stripe logo SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#fff" />
        <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#635BFF">Stripe</text>
      </svg>
      Stripe
    </button>
  );
};

export default StripeButton;