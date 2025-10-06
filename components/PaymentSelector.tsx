'use client';

import React, { useState } from 'react';
import StripeButton from './Stripe Checkout';
import WSPayButton from './WSPayCheckout';

interface PaymentSelectorProps {
  amount: number;
}

type PaymentProvider = 'stripe' | 'wspay';

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ amount }) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('wspay'); // WSPay kao default za Crnu Goru

  return (
    <div className="w-full">
      {/* Payment Provider Selection */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Izaberite način plaćanja:</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* WSPay Option */}
          <label className={`cursor-pointer border rounded-lg p-3 transition-all ${
            selectedProvider === 'wspay'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-300 hover:border-blue-300'
          }`}>
            <input
              type="radio"
              name="paymentProvider"
              value="wspay"
              checked={selectedProvider === 'wspay'}
              onChange={(e) => setSelectedProvider(e.target.value as PaymentProvider)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedProvider === 'wspay' ? 'border-blue-500' : 'border-gray-300'
              }`}>
                {selectedProvider === 'wspay' && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">WSPay (Simulacija)</div>
                <div className="text-sm text-gray-600">Lokalni provider (CG, RS, BA)</div>
                <div className="text-xs text-blue-600 font-medium">🧪 Test simulacija</div>
              </div>
            </div>
          </label>

          {/* Stripe Option */}
          <label className={`cursor-pointer border rounded-lg p-3 transition-all ${
            selectedProvider === 'stripe'
              ? 'border-indigo-500 bg-indigo-50 shadow-md'
              : 'border-gray-300 hover:border-indigo-300'
          }`}>
            <input
              type="radio"
              name="paymentProvider"
              value="stripe"
              checked={selectedProvider === 'stripe'}
              onChange={(e) => setSelectedProvider(e.target.value as PaymentProvider)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedProvider === 'stripe' ? 'border-indigo-500' : 'border-gray-300'
              }`}>
                {selectedProvider === 'stripe' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">Stripe</div>
                <div className="text-sm text-gray-600">Međunarodni provider</div>
                <div className="text-xs text-orange-600 font-medium">⚠ Ne radi u Crnoj Gori</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Button */}
      <div className="mt-4">
        {selectedProvider === 'wspay' && <WSPayButton amount={amount} />}
        {selectedProvider === 'stripe' && <StripeButton amount={amount} />}
      </div>

      {/* Info Note */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          {selectedProvider === 'wspay' && (
            <div>
              <strong>WSPay simulacija:</strong> Trenutno je aktivna simulacija plaćanja. Klikom na dugme ćete biti preusmjereni direktno na success stranicu. Za pravi WSPay integration potrebna je registracija na wspay.biz.
            </div>
          )}
          {selectedProvider === 'stripe' && (
            <div>
              <strong>Stripe test režim:</strong> Koristite test karticu 4242424242424242.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSelector;
