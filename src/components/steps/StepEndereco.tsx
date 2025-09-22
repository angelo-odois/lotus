'use client';

import { FormData } from '@/types/form';
import { config } from '@/config';
import { useState } from 'react';

interface StepEnderecoProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
}

export function StepEndereco({ formData, updateFormData }: StepEnderecoProps) {
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const searchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          updateFormData('logradouro', data.logradouro || '');
          updateFormData('bairro', data.bairro || '');
          updateFormData('cidade', data.localidade || '');
          updateFormData('uf', data.uf || '');
        }
      } catch (error) {
        console.log('Erro ao buscar CEP:', error);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Endereço</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
          <input
            type="text"
            required
            value={formData.cep}
            onChange={(e) => {
              const formatted = formatCep(e.target.value);
              updateFormData('cep', formatted);
            }}
            onBlur={(e) => searchCep(e.target.value)}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent
              ${isSearchingCep ? 'bg-yellow-50' : ''}
            `}
            placeholder="00000-000"
            disabled={isSearchingCep}
          />
          {isSearchingCep && (
            <p className="text-xs text-yellow-600 mt-1">🔍 Buscando endereço...</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro *</label>
          <input
            type="text"
            required
            value={formData.logradouro}
            onChange={(e) => updateFormData('logradouro', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Rua, Avenida, Quadra..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
          <input
            type="text"
            required
            value={formData.numero}
            onChange={(e) => updateFormData('numero', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <input
            type="text"
            value={formData.complemento || ''}
            onChange={(e) => updateFormData('complemento', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Apt, Bloco, Casa..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
          <input
            type="text"
            required
            value={formData.bairro}
            onChange={(e) => updateFormData('bairro', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Nome do bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
          <input
            type="text"
            required
            value={formData.cidade}
            onChange={(e) => updateFormData('cidade', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Nome da cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">UF *</label>
          <select
            required
            value={formData.uf}
            onChange={(e) => updateFormData('uf', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Selecione</option>
            {config.ufs.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}