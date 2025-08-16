'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Delete } from 'lucide-react';
import { useI18n } from '@/i18n/client';

export default function CalculadoraPage() {
  const { t } = useI18n();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          return;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    performOperation('=');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  };

  const Button = ({ onClick, className, children }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`h-16 text-xl font-semibold rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <ToolLayout
      title={t.calculatorTitle}
      description={t.calculatorDescription}
    >
      <div className="max-w-sm mx-auto bg-gray-100 rounded-2xl p-6 shadow-lg">
        {/* Display */}
        <div className="bg-black text-white p-4 rounded-lg mb-4 text-right">
          <div className="text-sm text-gray-400">
            {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
          </div>
          <div className="text-3xl font-mono truncate">
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {/* First row */}
          <Button
            onClick={clear}
            className="bg-red-500 text-white hover:bg-red-600 col-span-2"
          >
            C
          </Button>
          <Button
            onClick={() => setDisplay(display.slice(0, -1) || '0')}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            <Delete size={20} />
          </Button>
          <Button
            onClick={() => performOperation('÷')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            ÷
          </Button>

          {/* Second row */}
          <Button
            onClick={() => inputNumber('7')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            7
          </Button>
          <Button
            onClick={() => inputNumber('8')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            8
          </Button>
          <Button
            onClick={() => inputNumber('9')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            9
          </Button>
          <Button
            onClick={() => performOperation('×')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            ×
          </Button>

          {/* Third row */}
          <Button
            onClick={() => inputNumber('4')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            4
          </Button>
          <Button
            onClick={() => inputNumber('5')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            5
          </Button>
          <Button
            onClick={() => inputNumber('6')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            6
          </Button>
          <Button
            onClick={() => performOperation('-')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            -
          </Button>

          {/* Fourth row */}
          <Button
            onClick={() => inputNumber('1')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            1
          </Button>
          <Button
            onClick={() => inputNumber('2')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            2
          </Button>
          <Button
            onClick={() => inputNumber('3')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            3
          </Button>
          <Button
            onClick={() => performOperation('+')}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            +
          </Button>

          {/* Fifth row */}
          <Button
            onClick={() => inputNumber('0')}
            className="bg-gray-300 hover:bg-gray-400 col-span-2"
          >
            0
          </Button>
          <Button
            onClick={inputDecimal}
            className="bg-gray-300 hover:bg-gray-400"
          >
            .
          </Button>
          <Button
            onClick={calculate}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            =
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
