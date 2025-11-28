'use client';

import React, { useEffect, useState } from 'react';
import { getProizvodById } from '@/lib/actions/proizvodi';
import { toast } from 'react-hot-toast';
import { FaChartLine, FaShoppingCart, FaEye, FaHeart, FaArrowUp, FaArrowDown, FaCalendar } from 'react-icons/fa';

type Proizvod = {
  id: string;
  naziv_sr: string | null;
  cena: number;
  kolicina: number;
  kreiran: Date;
};

type StatisticsData = {
  prodaja: {
    ukupno_prodato: number;
    prihod: number;
    prosecna_ocena: number;
    broj_ocena: number;
  };
  aktivnost: {
    pregledi: number;
    dodato_u_korpu: number;
    dodato_u_omiljene: number;
    konverzija: number;
  };
  trendovi: {
    mesecni_trend: 'rast' | 'pad' | 'stabilno';
    procenat_promene: number;
    najbolji_mesec: string;
  };
};

interface StatistikeProizvodaClientProps {
  id: string;
}

export default function StatistikeProizvodaClient({ id }: StatistikeProizvodaClientProps) {
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [statistike, setStatistike] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getProizvodById(id);

        if (result.success && result.data) {
          setProizvod(result.data as Proizvod);

          // Mock statistics data - u realnoj aplikaciji bi ovo došlo iz baze
          const mockStats: StatisticsData = {
            prodaja: {
              ukupno_prodato: 127,
              prihod: Math.floor(127 * result.data.cena),
              prosecna_ocena: 4.3,
              broj_ocena: 89
            },
            aktivnost: {
              pregledi: 1547,
              dodato_u_korpu: 234,
              dodato_u_omiljene: 67,
              konverzija: 15.1
            },
            trendovi: {
              mesecni_trend: 'rast',
              procenat_promene: 12.5,
              najbolji_mesec: 'Novembar 2024'
            }
          };

          setStatistike(mockStats);
        } else {
          toast.error(result.error || 'Greška pri učitavanju proizvoda');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Poslednih 7 dana';
      case '30d': return 'Poslednih 30 dana';
      case '90d': return 'Poslednja 3 meseca';
      case '1y': return 'Poslednja godina';
      default: return 'Poslednih 30 dana';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!proizvod || !statistike) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          Proizvod ili statistike nisu pronađeni
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaChartLine className="text-blue-600 text-xl" />
              <h1 className="text-2xl font-bold text-gray-900">Statistike proizvoda</h1>
            </div>
            <p className="text-gray-600">
              {proizvod.naziv_sr || 'Bez naziva'} • ID: {proizvod.id}
            </p>
          </div>

          {/* Period Selector */}
          <div className="mt-4 lg:mt-0">
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as '7d' | '30d' | '90d' | '1y')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaShoppingCart className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-green-600 text-sm font-medium">Ukupno prodato</p>
              <p className="text-2xl font-bold text-green-900">{statistike.prodaja.ukupno_prodato}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-blue-600 text-sm font-medium">Ukupan prihod</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(statistike.prodaja.prihod)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
            <div>
              <p className="text-yellow-600 text-sm font-medium">Prosečna ocena</p>
              <p className="text-2xl font-bold text-yellow-900">
                {statistike.prodaja.prosecna_ocena.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">
                  ({statistike.prodaja.broj_ocena})
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaEye className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-purple-600 text-sm font-medium">Konverzija</p>
              <p className="text-2xl font-bold text-purple-900">{statistike.aktivnost.konverzija}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivnost korisnika</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <FaEye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{statistike.aktivnost.pregledi.toLocaleString()}</div>
            <div className="text-sm text-blue-600 font-medium">Pregledi stranice</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <FaShoppingCart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{statistike.aktivnost.dodato_u_korpu}</div>
            <div className="text-sm text-orange-600 font-medium">Dodato u korpu</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <FaHeart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">{statistike.aktivnost.dodato_u_omiljene}</div>
            <div className="text-sm text-red-600 font-medium">Dodato u omiljene</div>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trendovi prodaje</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {statistike.trendovi.mesecni_trend === 'rast' ? (
                  <FaArrowUp className="text-green-600 text-xl" />
                ) : statistike.trendovi.mesecni_trend === 'pad' ? (
                  <FaArrowDown className="text-red-600 text-xl" />
                ) : (
                  <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                )}
                <div>
                  <div className="font-medium text-gray-900">Mesečni trend</div>
                  <div className="text-sm text-gray-600">
                    {statistike.trendovi.mesecni_trend === 'rast' ? 'Rast' :
                     statistike.trendovi.mesecni_trend === 'pad' ? 'Pad' : 'Stabilno'}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold ${
                statistike.trendovi.mesecni_trend === 'rast' ? 'text-green-600' :
                statistike.trendovi.mesecni_trend === 'pad' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {statistike.trendovi.procenat_promene > 0 ? '+' : ''}
                {statistike.trendovi.procenat_promene}%
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <FaCalendar className="text-blue-600 text-xl" />
                <div>
                  <div className="font-medium text-gray-900">Najbolji mesec</div>
                  <div className="text-sm text-gray-600">Najveća prodaja</div>
                </div>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {statistike.trendovi.najbolji_mesec}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ključni indikatori</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-l-4 border-green-500 bg-green-50">
              <span className="text-gray-700">Dostupnost na stanju</span>
              <span className={`font-bold ${proizvod.kolicina > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {proizvod.kolicina > 0 ? `${proizvod.kolicina} kom` : 'Nema na stanju'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 border-l-4 border-blue-500 bg-blue-50">
              <span className="text-gray-700">Trenutna cijena</span>
              <span className="font-bold text-blue-600">{formatCurrency(proizvod.cena)}</span>
            </div>

            <div className="flex justify-between items-center p-3 border-l-4 border-purple-500 bg-purple-50">
              <span className="text-gray-700">Dani na tržištu</span>
              <span className="font-bold text-purple-600">
                {Math.floor((new Date().getTime() - new Date(proizvod.kreiran).getTime()) / (1000 * 60 * 60 * 24))} dana
              </span>
            </div>

            <div className="flex justify-between items-center p-3 border-l-4 border-orange-500 bg-orange-50">
              <span className="text-gray-700">Stopa konverzije</span>
              <span className="font-bold text-orange-600">{statistike.aktivnost.konverzija}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rezime performansi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {((statistike.aktivnost.dodato_u_korpu / statistike.aktivnost.pregledi) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Dodavanje u korpu</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {((statistike.prodaja.ukupno_prodato / statistike.aktivnost.dodato_u_korpu) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Završeno kupovina</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(statistike.prodaja.prihod / statistike.prodaja.ukupno_prodato)}
            </div>
            <div className="text-sm text-gray-600">Prosečna vrednost</div>
          </div>
        </div>
      </div>
    </div>
  );
}