'use client';

import { CheckCircle, Download, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface SuccessPageProps {
  customerName: string;
  proposalId?: string;
  message?: string;
  onNewProposal: () => void;
}

export function SuccessPage({ customerName, proposalId, message, onNewProposal }: SuccessPageProps) {

  return (
    <div className="min-h-screen bg-[#FEFCF7] font-inter">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#FFC629]/10 overflow-hidden max-w-2xl w-full">
          {/* Header Success */}
          <div className="relative bg-gradient-to-br from-green-400 to-green-500 p-12 text-center overflow-hidden">
            <div className="relative z-10">
              <CheckCircle className="mx-auto h-16 w-16 text-white mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">
                Proposta Enviada!
              </h1>
              <p className="text-green-100 text-lg">
                Sua proposta foi processada com sucesso
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Olá, {customerName}! 👋
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {message || 'Sua proposta foi registrada com sucesso. Nossa equipe de vendas entrará em contato em breve para dar andamento ao processo.'}
              </p>
              {proposalId && (
                <p className="text-sm text-gray-500 mt-2">
                  ID da Proposta: <code className="bg-gray-100 px-2 py-1 rounded">{proposalId}</code>
                </p>
              )}
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Dados Coletados</p>
                    <p className="text-sm text-green-700">Proposta registrada no sistema</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-[#FFC629]/10 border border-[#FFC629]/30 rounded-xl p-6 mb-8">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-[#1A1A1A] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📞 Próximos Passos
                </h3>
                <p className="text-gray-600 mb-4">
                  Nossa equipe analisará sua proposta e entrará em contato para dar andamento ao processo
                </p>
                <button
                  onClick={onNewProposal}
                  className="bg-[#FFC629] text-[#1A1A1A] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFD93D] transition-colors inline-flex items-center space-x-2"
                >
                  <span>Nova Proposta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#1A1A1A] text-white p-8 text-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/logo.svg" 
                alt="Lotus" 
                width={120} 
                height={38} 
                className="filter invert brightness-0 contrast-100" 
              />
            </div>
            <p className="text-sm font-semibold text-[#FFC629] mb-1">
              Lotus Cidade
            </p>
            <p className="text-xs text-gray-400">
              lotuscidade.com.br
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
