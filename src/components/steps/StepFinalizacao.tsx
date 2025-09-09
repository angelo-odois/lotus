'use client';

import { FormData, FileUpload } from '@/types/form';
import { config } from '@/config';

interface StepFinalizacaoProps {
  formData: FormData;
  uploadedFiles: FileUpload[];
  shouldShowSpouseStep: boolean;
}

export function StepFinalizacao({ formData, uploadedFiles, shouldShowSpouseStep }: StepFinalizacaoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Finalização</h2>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Resumo da Proposta</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Cliente:</span>
            <span className="ml-2 text-gray-900">{formData.nome || '-'}</span>
          </div>
          
          {shouldShowSpouseStep && formData.nomeConjuge && (
            <div>
              <span className="font-medium text-gray-600">Cônjuge:</span>
              <span className="ml-2 text-gray-900">{formData.nomeConjuge}</span>
            </div>
          )}
          
          <div>
            <span className="font-medium text-gray-600">Empreendimento:</span>
            <span className="ml-2 text-gray-900">
              {config.empreendimentos[formData.empreendimento as keyof typeof config.empreendimentos] || '-'}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Unidade:</span>
            <span className="ml-2 text-gray-900">{formData.unidadeNumero || '-'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Valor do Imóvel:</span>
            <span className="ml-2 text-green-600 font-semibold">R$ {formData.valorImovel || '0,00'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Valor de Entrada:</span>
            <span className="ml-2 text-green-600 font-semibold">R$ {formData.valorEntrada || '0,00'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Valor a Financiar:</span>
            <span className="ml-2 text-green-600 font-semibold">R$ {formData.valorFinanciar || '0,00'}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Documentos:</span>
            <span className="ml-2 text-gray-900">{uploadedFiles.length} arquivo(s)</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          Ao enviar esta proposta, você concorda que as informações fornecidas são verdadeiras e 
          autoriza a Lotus Cidade a processar seus dados para análise da proposta de compra. 
          O PDF será gerado e enviado via WhatsApp para o número cadastrado.
        </p>
      </div>
    </div>
  );
}