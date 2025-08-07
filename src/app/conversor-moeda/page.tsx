'use client';

import { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { DollarSign, ArrowLeftRight, TrendingUp, Clock } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export default function ConversorMoedaPage() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dados simulados de moedas (em um app real, viria de uma API)
  const currencies: Currency[] = [
    { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Yuan Chinês', symbol: '¥', flag: '🇨🇳' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'ARG', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' }
  ];

  // Taxas de câmbio simuladas (em um app real, viria de uma API como exchangerate-api.com)
  const exchangeRates: { [key: string]: { [key: string]: number } } = {
    USD: {
      BRL: 5.15,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.25,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      MXN: 20.15,
      ARG: 98.50,
      CLP: 780.25,
      USD: 1
    },
    BRL: {
      USD: 0.19,
      EUR: 0.16,
      GBP: 0.14,
      JPY: 21.40,
      CAD: 0.24,
      AUD: 0.26,
      CHF: 0.18,
      CNY: 1.25,
      MXN: 3.91,
      ARG: 19.13,
      CLP: 151.50,
      BRL: 1
    },
    EUR: {
      USD: 1.18,
      BRL: 6.06,
      GBP: 0.86,
      JPY: 129.85,
      CAD: 1.47,
      AUD: 1.59,
      CHF: 1.08,
      CNY: 7.59,
      MXN: 23.71,
      ARG: 115.95,
      CLP: 918.50,
      EUR: 1
    }
  };

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  };

  const convertCurrency = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setResult(null);
      return;
    }

    setLoading(true);
    
    // Simular delay de API
    setTimeout(() => {
      const fromRate = exchangeRates[fromCurrency];
      if (fromRate && fromRate[toCurrency]) {
        const rate = fromRate[toCurrency];
        const convertedAmount = parseFloat(amount) * rate;
        setResult(convertedAmount);
        setLastUpdated(new Date());
      } else {
        // Fallback para conversão indireta via USD
        const fromToUsd = exchangeRates[fromCurrency]?.['USD'] || 1;
        const usdToTarget = exchangeRates['USD']?.[toCurrency] || 1;
        const convertedAmount = parseFloat(amount) * fromToUsd * usdToTarget;
        setResult(convertedAmount);
        setLastUpdated(new Date());
      }
      setLoading(false);
    }, 800);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatCurrency = (value: number, currencyCode: string): string => {
    const currency = getCurrencyByCode(currencyCode);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const getExchangeRate = (): number | null => {
    if (!amount || !result) return null;
    return result / parseFloat(amount);
  };

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  return (
    <ToolLayout
      title="Conversor de Moedas"
      description="Converta moedas com taxas de câmbio simuladas em tempo real."
    >
      <div className="space-y-6">
        {/* Conversor Principal */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign size={20} className="text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Conversor de Moedas</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            {/* Valor */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Moeda de origem */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                De
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de troca */}
            <div className="lg:col-span-1 flex justify-center">
              <button
                onClick={swapCurrencies}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-full transition-colors"
                title="Trocar moedas"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* Moeda de destino */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para
              </label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de conversão */}
            <div className="lg:col-span-1">
              <button
                onClick={convertCurrency}
                disabled={loading || !amount}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Convertendo...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Converter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resultado */}
        {result !== null && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(result, toCurrency)}
              </div>
              <div className="text-gray-600 mb-4">
                {getCurrencyByCode(fromCurrency)?.flag} {formatCurrency(parseFloat(amount), fromCurrency)} = {getCurrencyByCode(toCurrency)?.flag} {formatCurrency(result, toCurrency)}
              </div>
              
              {getExchangeRate() && (
                <div className="bg-white/60 rounded-lg p-3 inline-block">
                  <div className="text-sm text-gray-700">
                    <strong>Taxa de câmbio:</strong> 1 {fromCurrency} = {getExchangeRate()?.toFixed(6)} {toCurrency}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Última atualização */}
        {lastUpdated && (
          <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
            <Clock size={14} />
            Última atualização: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* Lista de moedas populares */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Moedas Populares</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currencies.slice(0, 8).map((currency) => (
              <div
                key={currency.code}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => {
                  if (fromCurrency !== currency.code) {
                    setFromCurrency(currency.code);
                  } else {
                    setToCurrency(currency.code);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currency.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.symbol}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• As taxas de câmbio são simuladas e não refletem valores reais do mercado</li>
            <li>• Para conversões financeiras reais, consulte fontes oficiais como bancos ou APIs de câmbio</li>
            <li>• Os valores são apenas para demonstração e não devem ser usados para transações</li>
            <li>• As taxas são atualizadas a cada conversão com dados fictícios</li>
          </ul>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas de Uso:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use o botão de troca para inverter rapidamente as moedas</li>
            <li>• Clique nas moedas populares para selecioná-las rapidamente</li>
            <li>• A conversão é atualizada automaticamente quando você muda os valores</li>
            <li>• Suporte a decimais para conversões precisas</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
