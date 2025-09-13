'use client';

import { CheckCircle, Download, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface SuccessPageProps {
  customerName: string;
  pdfFilename?: string;
  message?: string;
  onNewProposal: () => void;
}

export function SuccessPage({ customerName, pdfFilename, message, onNewProposal }: SuccessPageProps) {

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
                {message || 'Sua proposta foi gerada com sucesso! Faça o download do arquivo PDF abaixo.'}
              </p>
            </div>

            {/* Download PDF */}
            {pdfFilename && (
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Download className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">PDF Gerado</p>
                        <p className="text-sm text-blue-700">Sua proposta está pronta para download</p>
                      </div>
                    </div>
                    <a
                      href={`/api/download-pdf/${pdfFilename}`}
                      download
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="bg-[#FFC629]/10 border border-[#FFC629]/30 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ✨ Proposta Concluída
                </h3>
                <p className="text-gray-600 mb-4">
                  Sua proposta foi gerada com sucesso! Salve o PDF para seus registros.
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
