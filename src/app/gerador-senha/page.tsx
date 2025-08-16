'use client';

import { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Copy, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { useI18n } from '@/i18n/client';

interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export default function GeradorSenhaPage() {
  const { t } = useI18n();
  const [password, setPassword] = useState('Gx7$kP9#mL2qR8@nF4');
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });

  const generatePassword = () => {
    let charset = '';
    
    if (config.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (config.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (config.includeNumbers) charset += '0123456789';
    if (config.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (config.excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, '');
    }
    
    if (!charset) {
      alert(t.passwordGenerator.selectAtLeastOne);
      return;
    }
    
    let newPassword = '';
    for (let i = 0; i < config.length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(newPassword);
    setCopied(false);
  };

  const copyPassword = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Como último recurso, seleciona o texto no input
      const passwordInput = document.querySelector('input[readonly]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.select();
        passwordInput.setSelectionRange(0, 99999); // Para mobile
      }
      alert(t.passwordGenerator.passwordSelected);
    }
  };

  const getPasswordStrength = () => {
    let score = 0;
    let feedback = '';
    
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    if (score < 30) feedback = t.passwordGenerator.strengthWeak;
    else if (score < 60) feedback = t.passwordGenerator.strengthMedium;
    else if (score < 80) feedback = t.passwordGenerator.strengthStrong;
    else feedback = t.passwordGenerator.strengthVeryStrong;
    
    return { score, feedback };
  };

  const strength = getPasswordStrength();
  return (
    <ToolLayout
      title={t.passwordGeneratorTitle}
      description={t.passwordGeneratorDescription}
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t.passwordGenerator.generatedPassword}</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={password}
              readOnly
              className="flex-1 border border-gray-300 rounded-md px-3 py-3 bg-white font-mono text-lg"
            />
            <button 
              onClick={copyPassword}
              className={`px-4 py-3 rounded-md transition-colors ${
                copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={copied ? t.passwordGenerator.copied : t.passwordGenerator.copy}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
            <button 
              onClick={generatePassword}
              className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
              title={t.passwordGenerator.generate}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t.passwordGenerator.settings}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.passwordGenerator.length}: <span className="font-bold">{config.length}</span>
              </label>
              <input 
                type="range" 
                min="4" 
                max="50" 
                value={config.length}
                onChange={(e) => setConfig({...config, length: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>50</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.includeUppercase}
                  onChange={(e) => setConfig({...config, includeUppercase: e.target.checked})}
                  className="mr-3" 
                />
                <span>{t.passwordGenerator.includeUppercase}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.includeLowercase}
                  onChange={(e) => setConfig({...config, includeLowercase: e.target.checked})}
                  className="mr-3" 
                />
                <span>{t.passwordGenerator.includeLowercase}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.includeNumbers}
                  onChange={(e) => setConfig({...config, includeNumbers: e.target.checked})}
                  className="mr-3" 
                />
                <span>{t.passwordGenerator.includeNumbers}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.includeSymbols}
                  onChange={(e) => setConfig({...config, includeSymbols: e.target.checked})}
                  className="mr-3" 
                />
                <span>{t.passwordGenerator.includeSymbols}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={config.excludeAmbiguous}
                  onChange={(e) => setConfig({...config, excludeAmbiguous: e.target.checked})}
                  className="mr-3" 
                />
                <span>{t.passwordGenerator.excludeAmbiguous}</span>
              </label>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          strength.score >= 80 ? 'bg-green-50 border-green-200' :
          strength.score >= 60 ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            strength.score >= 80 ? 'text-green-800' :
            strength.score >= 60 ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {t.passwordGenerator.passwordStrength}: {strength.feedback}
          </h4>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                strength.score >= 80 ? 'bg-green-600' :
                strength.score >= 60 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{width: `${strength.score}%`}}
            ></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
