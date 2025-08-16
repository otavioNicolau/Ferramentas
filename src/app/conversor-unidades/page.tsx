'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { useI18n } from '@/i18n/client';

export default function ConversorUnidadesPage() {
  const { t } = useI18n();
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');

  const conversions: { [key: string]: number } = {
    // Comprimento para metros
    'm': 1,
    'km': 1000,
    'cm': 0.01,
    'mm': 0.001,
    'in': 0.0254,
    'ft': 0.3048,
    'mi': 1609.344,
  };

  const handleConvert = (value: string) => {
    setFromValue(value);
    if (value && !isNaN(parseFloat(value))) {
      const num = parseFloat(value);
      const fromFactor = conversions[fromUnit] || 1;
      const toFactor = conversions[toUnit] || 1;
      const result = (num * fromFactor) / toFactor;
      setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
    } else {
      setToValue('');
    }
  };

  return (
    <ToolLayout
      title={t.unitConverterTitle}
      description={t.unitConverterDescription}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
            <div className="space-y-2">
              <select
                value={fromUnit}
                onChange={(e) => {
                  setFromUnit(e.target.value);
                  handleConvert(fromValue);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="m">Metro</option>
                <option value="km">Quilômetro</option>
                <option value="cm">Centímetro</option>
                <option value="mm">Milímetro</option>
                <option value="in">Polegada</option>
                <option value="ft">Pé</option>
                <option value="mi">Milha</option>
              </select>
              <input
                type="number"
                value={fromValue}
                onChange={(e) => handleConvert(e.target.value)}
                placeholder="Digite o valor"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Para</label>
            <div className="space-y-2">
              <select
                value={toUnit}
                onChange={(e) => {
                  setToUnit(e.target.value);
                  handleConvert(fromValue);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="m">Metro</option>
                <option value="km">Quilômetro</option>
                <option value="cm">Centímetro</option>
                <option value="mm">Milímetro</option>
                <option value="in">Polegada</option>
                <option value="ft">Pé</option>
                <option value="mi">Milha</option>
              </select>
              <input
                type="number"
                value={toValue}
                readOnly
                placeholder="Resultado"
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {fromValue && toValue && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-center text-lg">
              <strong>{fromValue} {fromUnit}</strong> = <strong>{toValue} {toUnit}</strong>
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
