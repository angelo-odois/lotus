'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface PropostaDetalhada {
  id: string;
  dados_pessoais: any;
  endereco: any;
  dados_conjuge: any;
  empreendimento: any;
  unidade: any;
  documentos: any;
  status: string;
  pdf_gerado: boolean;
  created_at: string;
  updated_at: string;
}

export default function PropostaDetalhePage() {
  const [proposta, setProposta] = useState<PropostaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const loadProposta = async () => {
      try {
        const response = await fetch(`/api/propostas?id=${id}`);
        
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        
        if (response.status === 404) {
          router.push('/admin/dashboard');
          return;
        }
        
        const data = await response.json();
        setProposta(data.proposta);
      } catch (error) {
        console.error('Erro ao carregar proposta:', error);
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProposta();
    }
  }, [id, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    
    // Remove formatação existente e converte para número
    const numericValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    
    if (isNaN(numericValue)) return value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Proposta não encontrada</p>
          <Link href="/admin/dashboard" className="text-yellow-600 hover:text-yellow-500">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/admin/dashboard" className="text-yellow-600 hover:text-yellow-500 text-sm">
                ← Voltar ao Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Detalhes da Proposta
              </h1>
              <p className="text-gray-600">ID: {proposta.id}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposta.status === 'concluida' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {proposta.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposta.pdf_gerado 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {proposta.pdf_gerado ? 'PDF Gerado' : 'PDF Não Gerado'}
              </span>
              {proposta.pdf_gerado && (
                <a
                  href={`/api/admin/pdf/${proposta.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm font-medium"
                >
                  📄 Baixar PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Dados Pessoais */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.nome || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CPF/CNPJ</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.cpfCnpj || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">RG/Inscrição Estadual</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.rgInsEst || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.telefoneCelular || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Profissão</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.profissao || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado Civil</dt>
                <dd className="text-sm text-gray-900">{proposta.dados_pessoais?.estadoCivil || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Endereço */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">CEP</dt>
                <dd className="text-sm text-gray-900">{proposta.endereco?.cep || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Logradouro</dt>
                <dd className="text-sm text-gray-900">{proposta.endereco?.logradouro || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Número</dt>
                <dd className="text-sm text-gray-900">{proposta.endereco?.numero || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Complemento</dt>
                <dd className="text-sm text-gray-900">{proposta.endereco?.complemento || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                <dd className="text-sm text-gray-900">{proposta.endereco?.bairro || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cidade/UF</dt>
                <dd className="text-sm text-gray-900">
                  {proposta.endereco?.cidade || 'N/A'} - {proposta.endereco?.uf || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Empreendimento e Unidade */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Empreendimento</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Empreendimento</dt>
                <dd className="text-sm text-gray-900">{(() => {
                  if (typeof proposta.empreendimento === 'string') return proposta.empreendimento;
                  const nested = proposta.empreendimento?.empreendimento;
                  if (typeof nested === 'string') return nested;
                  if (nested?.empreendimento) return String(nested.empreendimento);
                  return proposta.empreendimento?.empreendimento ? String(proposta.empreendimento.empreendimento) : 'N/A';
                })()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Número da Unidade</dt>
                <dd className="text-sm text-gray-900">{proposta.unidade?.unidadeNumero || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor do Imóvel</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(proposta.unidade?.valorImovel || '0')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor da Entrada</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(proposta.unidade?.valorEntrada || '0')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor a Financiar</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(proposta.unidade?.valorFinanciar || '0')}</dd>
              </div>
            </dl>
          </div>

          {/* Documentos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documentos</h3>
            {proposta.documentos?.arquivos && proposta.documentos.arquivos.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {proposta.documentos.arquivos.map((arquivo: any, index: number) => (
                  <li key={index} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{arquivo.name}</p>
                        <p className="text-sm text-gray-500">
                          Tipo: {arquivo.type} | Categoria: {arquivo.category || 'N/A'}
                        </p>
                        {arquivo.size && (
                          <p className="text-sm text-gray-500">
                            Tamanho: {(arquivo.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                      <span className="text-green-600 text-sm">✓ Anexado</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum documento anexado</p>
            )}
            
            {proposta.documentos?.pdfFilename && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900">PDF da Proposta</p>
                <p className="text-sm text-gray-500">{proposta.documentos.pdfFilename}</p>
              </div>
            )}
          </div>

          {/* Dados do Cônjuge (se aplicável) */}
          {proposta.dados_conjuge && (
            <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cônjuge</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.nomeConjuge || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPF</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.cpfConjuge || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">RG</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.rgConjuge || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.emailConjuge || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.telefoneCelularConjuge || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Profissão</dt>
                  <dd className="text-sm text-gray-900">{proposta.dados_conjuge.profissaoConjuge || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Visualizador de PDF */}
          {proposta.pdf_gerado && (
            <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Visualização do PDF</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={`/api/admin/pdf/${proposta.id}`}
                  className="w-full h-96"
                  title="Visualização da Proposta PDF"
                />
              </div>
              <div className="mt-4 text-center space-x-4">
                <a
                  href={`/api/admin/pdf/${proposta.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  👁️ Abrir PDF em Nova Aba
                </a>
                <a
                  href={`/api/admin/download/${proposta.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  📥 Baixar PDF
                </a>
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                <dd className="text-sm text-gray-900">{formatDate(proposta.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Última Atualização</dt>
                <dd className="text-sm text-gray-900">{formatDate(proposta.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID da Proposta</dt>
                <dd className="text-sm text-gray-900 font-mono">{proposta.id}</dd>
              </div>
            </dl>
          </div>

        </div>
      </div>
    </div>
  );
}