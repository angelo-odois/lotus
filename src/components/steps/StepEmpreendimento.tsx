'use client';

import { FormData } from '@/types/form';
import { config } from '@/config';

interface StepEmpreendimentoProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
}

export function StepEmpreendimento({ formData, updateFormData }: StepEmpreendimentoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Empreendimento</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(config.empreendimentos).map(([key, name]) => (
          <label
            key={key}
            className={`
              cursor-pointer p-6 border-2 rounded-xl transition-all
              ${
                formData.empreendimento === key
                  ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                  : 'border-gray-300 hover:border-yellow-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="radio"
              name="empreendimento"
              value={key}
              checked={formData.empreendimento === key}
              onChange={(e) => updateFormData('empreendimento', e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-600">Residencial</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}