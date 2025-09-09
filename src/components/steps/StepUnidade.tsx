'use client';

import { FormData } from '@/types/form';
import { useEffect } from 'react';

interface StepUnidadeProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
  calculateFinancing: () => void;
}

export function StepUnidade({ formData, updateFormData, calculateFinancing }: StepUnidadeProps) {
  useEffect(() => {
    calculateFinancing();
  }, [formData.valorImovel, formData.valorEntrada, calculateFinancing]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unidade e Valores</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número da Unidade *</label>
          <input
            type="text"
            required
            value={formData.unidadeNumero}
            onChange={(e) => updateFormData('unidadeNumero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Ex: 101, 205, Torre A - Apt 1502"
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores da Proposta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor do Imóvel (R$) *</label>
              <input
                type="text"
                required
                value={formData.valorImovel}
                onChange={(e) => updateFormData('valorImovel', formatCurrency(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="4500.000,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor de Entrada (R$) *</label>
              <input
                type="text"
                required
                value={formData.valorEntrada}
                onChange={(e) => updateFormData('valorEntrada', formatCurrency(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="900.000,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor a Financiar (R$)</label>
              <input
                type="text"
                readOnly
                value={formData.valorFinanciar}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
                placeholder="360.000,00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
