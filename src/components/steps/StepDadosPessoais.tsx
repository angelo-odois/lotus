'use client';

import { FormData } from '@/types/form';

interface StepDadosPessoaisProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
}

export function StepDadosPessoais({ formData, updateFormData }: StepDadosPessoaisProps) {
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    }
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Dados Pessoais</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            value={formData.nome}
            onChange={(e) => updateFormData('nome', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF/CNPJ *
          </label>
          <input
            type="text"
            required
            value={formData.cpfCnpj}
            onChange={(e) => updateFormData('cpfCnpj', formatCPF(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG/Ins. Est. *
          </label>
          <input
            type="text"
            required
            value={formData.rgInsEst}
            onChange={(e) => updateFormData('rgInsEst', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="00.000.000-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Órgão Expedidor *
          </label>
          <input
            type="text"
            required
            value={formData.orgaoExpedidor}
            onChange={(e) => updateFormData('orgaoExpedidor', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="SSP/DF"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sexo *
          </label>
          <select
            required
            value={formData.sexo}
            onChange={(e) => updateFormData('sexo', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento *
          </label>
          <input
            type="text"
            required
            value={formData.dataNascimento}
            onChange={(e) => updateFormData('dataNascimento', formatDate(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naturalidade *
          </label>
          <input
            type="text"
            required
            value={formData.naturalidade}
            onChange={(e) => updateFormData('naturalidade', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Brasília"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nacionalidade *
          </label>
          <input
            type="text"
            required
            value={formData.nacionalidade}
            onChange={(e) => updateFormData('nacionalidade', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Brasileira"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone Celular *
          </label>
          <input
            type="tel"
            required
            value={formData.telefoneCelular}
            onChange={(e) => updateFormData('telefoneCelular', formatPhone(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="(61) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone Comercial
          </label>
          <input
            type="tel"
            value={formData.telefoneComercial || ''}
            onChange={(e) => updateFormData('telefoneComercial', formatPhone(e.target.value))}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="(61) 3333-3333"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-mail *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profissão *
          </label>
          <input
            type="text"
            required
            value={formData.profissao}
            onChange={(e) => updateFormData('profissao', e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Sua profissão"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Estado Civil *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 'solteiro', label: 'Solteiro(a)' },
              { value: 'casado', label: 'Casado(a)' },
              { value: 'separado', label: 'Separado Jud.' },
              { value: 'divorciado', label: 'Divorciado(a)' },
              { value: 'viuvo', label: 'Viúvo(a)' },
              { value: 'uniao-estavel', label: 'União Estável' }
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="estadoCivil"
                  value={value}
                  checked={formData.estadoCivil === value}
                  onChange={(e) => updateFormData('estadoCivil', e.target.value)}
                  className="text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}