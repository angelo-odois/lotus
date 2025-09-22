'use client';

import { FormData } from '@/types/form';

interface StepConjugeProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
}

export function StepConjuge({ formData, updateFormData }: StepConjugeProps) {
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      let formatted = numbers.replace(/(\d{2})(\d)/, '($1) $2');
      if (numbers.length >= 10) {
        formatted = formatted.replace(/(\(\d{2}\) \d{4,5})(\d{4})/, '$1-$2');
      }
      return formatted;
    }
    return numbers;
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;

    if (numbers.length >= 2) {
      formatted = numbers.replace(/(\d{2})(\d)/, '$1/$2');
    }
    if (numbers.length >= 4) {
      formatted = numbers.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
    }

    return formatted.substring(0, 10); // Limita a 10 caracteres (DD/MM/AAAA)
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cônjuge</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
          <input
            type="text"
            required
            value={formData.nomeConjuge || ''}
            onChange={(e) => updateFormData('nomeConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Nome completo do cônjuge"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
          <input
            type="text"
            required
            value={formData.cpfConjuge || ''}
            onChange={(e) => updateFormData('cpfConjuge', formatCPF(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RG/Ins. Est. *</label>
          <input
            type="text"
            required
            value={formData.rgConjuge || ''}
            onChange={(e) => updateFormData('rgConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="00.000.000-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Órgão Expedidor *</label>
          <input
            type="text"
            required
            value={formData.orgaoExpedidorConjuge || ''}
            onChange={(e) => updateFormData('orgaoExpedidorConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="SSP/DF"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sexo *</label>
          <select
            required
            value={formData.sexoConjuge || ''}
            onChange={(e) => updateFormData('sexoConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
          <input
            type="text"
            required
            value={formData.dataNascimentoConjuge || ''}
            onChange={(e) => updateFormData('dataNascimentoConjuge', formatDate(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Naturalidade *</label>
          <input
            type="text"
            required
            value={formData.naturalidadeConjuge || ''}
            onChange={(e) => updateFormData('naturalidadeConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Brasília"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidade *</label>
          <input
            type="text"
            required
            value={formData.nacionalidadeConjuge || ''}
            onChange={(e) => updateFormData('nacionalidadeConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Brasileira"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone Celular *</label>
          <input
            type="tel"
            required
            value={formData.telefoneCelularConjuge || ''}
            onChange={(e) => updateFormData('telefoneCelularConjuge', formatPhone(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="(61) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <input
            type="email"
            value={formData.emailConjuge || ''}
            onChange={(e) => updateFormData('emailConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="conjuge@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profissão *</label>
          <input
            type="text"
            required
            value={formData.profissaoConjuge || ''}
            onChange={(e) => updateFormData('profissaoConjuge', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Profissão do cônjuge"
          />
        </div>
      </div>
    </div>
  );
}