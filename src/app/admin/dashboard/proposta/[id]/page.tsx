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
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const loadProposta = async () => {
      try {
        const response = await fetch(`/api/list?id=${id}`);
        
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        
        if (response.status === 404) {
          router.push('/admin/dashboard');
          return;
        }
        
        const data = await response.json();
        setProposta(data.proposta || data);
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

  const handleEdit = () => {
    if (!proposta) return;

    setEditData({
      nome: proposta.dados_pessoais?.nome || '',
      cpfCnpj: proposta.dados_pessoais?.cpfCnpj || '',
      rgInsEst: proposta.dados_pessoais?.rgInsEst || '',
      email: proposta.dados_pessoais?.email || '',
      telefoneCelular: proposta.dados_pessoais?.telefoneCelular || '',
      profissao: proposta.dados_pessoais?.profissao || '',
      estadoCivil: proposta.dados_pessoais?.estadoCivil || '',
      cep: proposta.endereco?.cep || '',
      logradouro: proposta.endereco?.logradouro || '',
      numero: proposta.endereco?.numero || '',
      complemento: proposta.endereco?.complemento || '',
      bairro: proposta.endereco?.bairro || '',
      cidade: proposta.endereco?.cidade || '',
      uf: proposta.endereco?.uf || '',
      unidadeNumero: proposta.unidade?.unidadeNumero || '',
      valorImovel: proposta.unidade?.valorImovel || '',
      valorEntrada: proposta.unidade?.valorEntrada || '',
      valorFinanciar: proposta.unidade?.valorFinanciar || '',
      valorSinal: proposta.unidade?.valorSinal || '',
      valorMensais: proposta.unidade?.valorMensais || '',
      valorSemestral: proposta.unidade?.valorSemestral || '',
      valorChaves: proposta.unidade?.valorChaves || '',
      parcelasMensais: proposta.unidade?.parcelasMensais || '',
      parcelasSemestrais: proposta.unidade?.parcelasSemestrais || '',
      empreendimento: (() => {
        if (typeof proposta.empreendimento === 'string') return proposta.empreendimento;
        const nested = proposta.empreendimento?.empreendimento;
        if (typeof nested === 'string') return nested;
        if (nested?.empreendimento) return String(nested.empreendimento);
        return proposta.empreendimento?.empreendimento ? String(proposta.empreendimento.empreendimento) : '';
      })(),
      // Dados do cônjuge
      nomeConjuge: proposta.dados_conjuge?.nomeConjuge || '',
      cpfConjuge: proposta.dados_conjuge?.cpfConjuge || '',
      rgConjuge: proposta.dados_conjuge?.rgConjuge || '',
      orgaoExpedidorConjuge: proposta.dados_conjuge?.orgaoExpedidorConjuge || '',
      sexoConjuge: proposta.dados_conjuge?.sexoConjuge || '',
      dataNascimentoConjuge: proposta.dados_conjuge?.dataNascimentoConjuge || '',
      naturalidadeConjuge: proposta.dados_conjuge?.naturalidadeConjuge || '',
      nacionalidadeConjuge: proposta.dados_conjuge?.nacionalidadeConjuge || '',
      telefoneCelularConjuge: proposta.dados_conjuge?.telefoneCelularConjuge || '',
      emailConjuge: proposta.dados_conjuge?.emailConjuge || '',
      profissaoConjuge: proposta.dados_conjuge?.profissaoConjuge || ''
    });

    setEditing(true);
  };

  const handleSave = async () => {
    if (!proposta) return;

    setSaving(true);

    try {
      // 1. Atualizar dados da proposta
      const response = await fetch('/api/proposta', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          propostaId: proposta.id,
          ...editData
        }),
      });

      if (response.ok) {
        // 2. Regenerar PDF automaticamente
        const regenerateResponse = await fetch('/api/admin/regenerate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({ propostaId: proposta.id }),
        });

        if (regenerateResponse.ok) {
          alert('Proposta atualizada e PDF regenerado com sucesso!');
        } else {
          alert('Proposta atualizada, mas houve erro ao regenerar o PDF.');
        }

        setEditing(false);

        // 3. Recarregar dados
        const propostaResponse = await fetch(`/api/list?id=${proposta.id}`);
        if (propostaResponse.ok) {
          const propostaData = await propostaResponse.json();
          setProposta(propostaData.proposta || propostaData);
        }
      } else {
        const data = await response.json();
        alert(`Erro ao atualizar: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({});
  };

  const handleRegeneratePdf = async () => {
    if (!confirm('Deseja regerar o PDF desta proposta?')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/regenerate-pdf', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propostaId: proposta.id }),
      });

      if (response.ok) {
        alert('PDF regenerado com sucesso!');
        // Recarregar a proposta para atualizar os dados
        const propostaResponse = await fetch(`/api/list?id=${proposta.id}`);
        if (propostaResponse.ok) {
          const propostaData = await propostaResponse.json();
          setProposta(propostaData.proposta || propostaData);
        }
      } else {
        const data = await response.json();
        alert(`Erro ao regerar PDF: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao regerar PDF:', error);
      alert('Erro ao regerar PDF. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/delete-proposta', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propostaId: proposta.id }),
      });

      if (response.ok) {
        alert('Proposta excluída com sucesso!');
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        alert(`Erro ao excluir: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposta.status === 'concluida'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {proposta.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações da Proposta */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {!editing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Proposta
                </button>

                <button
                  onClick={handleRegeneratePdf}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {saving ? 'Regenerando...' : 'Regerar PDF'}
                </button>

                <a
                  href={`/api/download-pdf/${proposta.documentos?.pdfFilename || `proposta-${proposta.id}.pdf`}`}
                  download
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir Proposta
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>

                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Dados Pessoais */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h3>
            {!editing ? (
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
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <input
                    type="text"
                    value={editData.nome || ''}
                    onChange={(e) => setEditData({...editData, nome: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CPF/CNPJ</label>
                  <input
                    type="text"
                    value={editData.cpfCnpj || ''}
                    onChange={(e) => setEditData({...editData, cpfCnpj: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">RG/Inscrição Estadual</label>
                  <input
                    type="text"
                    value={editData.rgInsEst || ''}
                    onChange={(e) => setEditData({...editData, rgInsEst: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <input
                    type="text"
                    value={editData.telefoneCelular || ''}
                    onChange={(e) => setEditData({...editData, telefoneCelular: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Profissão</label>
                  <input
                    type="text"
                    value={editData.profissao || ''}
                    onChange={(e) => setEditData({...editData, profissao: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado Civil</label>
                  <select
                    value={editData.estadoCivil || ''}
                    onChange={(e) => setEditData({...editData, estadoCivil: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao-estavel">União Estável</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Endereço */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            {!editing ? (
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
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">CEP</label>
                  <input
                    type="text"
                    value={editData.cep || ''}
                    onChange={(e) => setEditData({...editData, cep: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Logradouro</label>
                  <input
                    type="text"
                    value={editData.logradouro || ''}
                    onChange={(e) => setEditData({...editData, logradouro: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número</label>
                  <input
                    type="text"
                    value={editData.numero || ''}
                    onChange={(e) => setEditData({...editData, numero: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Complemento</label>
                  <input
                    type="text"
                    value={editData.complemento || ''}
                    onChange={(e) => setEditData({...editData, complemento: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bairro</label>
                  <input
                    type="text"
                    value={editData.bairro || ''}
                    onChange={(e) => setEditData({...editData, bairro: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cidade</label>
                  <input
                    type="text"
                    value={editData.cidade || ''}
                    onChange={(e) => setEditData({...editData, cidade: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">UF</label>
                  <select
                    value={editData.uf || ''}
                    onChange={(e) => setEditData({...editData, uf: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Empreendimento e Unidade */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Empreendimento</h3>
            {!editing ? (
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Empreendimento</dt>
                  <dd className="text-sm text-gray-900">{(() => {
                    if (typeof proposta.empreendimento === 'string') return proposta.empreendimento.toUpperCase();
                    const nested = proposta.empreendimento?.empreendimento;
                    if (typeof nested === 'string') return nested.toUpperCase();
                    if (nested?.empreendimento) return String(nested.empreendimento).toUpperCase();
                    return proposta.empreendimento?.empreendimento ? String(proposta.empreendimento.empreendimento).toUpperCase() : 'N/A';
                  })()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Número da Unidade</dt>
                  <dd className="text-sm text-gray-900">{proposta.unidade?.unidadeNumero || 'N/A'}</dd>
                </div>
                {(() => {
                  const empreendimentoValue = (() => {
                    if (typeof proposta.empreendimento === 'string') return proposta.empreendimento;
                    const nested = proposta.empreendimento?.empreendimento;
                    if (typeof nested === 'string') return nested;
                    if (nested?.empreendimento) return String(nested.empreendimento);
                    return proposta.empreendimento?.empreendimento ? String(proposta.empreendimento.empreendimento) : '';
                  })();

                  const isVert = empreendimentoValue.toLowerCase() === 'vert';

                  if (isVert) {
                    return (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Valor do Sinal</dt>
                          <dd className="text-sm text-gray-900">{formatCurrency(proposta.unidade?.valorSinal || '0')}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Valor das Mensais</dt>
                          <dd className="text-sm text-gray-900">
                            {formatCurrency(proposta.unidade?.valorMensais || '0')}
                            {proposta.unidade?.parcelasMensais && (
                              <span className="text-gray-500 ml-2">({proposta.unidade.parcelasMensais}x)</span>
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Valor do Semestral</dt>
                          <dd className="text-sm text-gray-900">
                            {formatCurrency(proposta.unidade?.valorSemestral || '0')}
                            {proposta.unidade?.parcelasSemestrais && (
                              <span className="text-gray-500 ml-2">({proposta.unidade.parcelasSemestrais}x)</span>
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Valor das Chaves</dt>
                          <dd className="text-sm text-gray-900">{formatCurrency(proposta.unidade?.valorChaves || '0')}</dd>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
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
                      </>
                    );
                  }
                })()}
              </dl>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Empreendimento</label>
                  <select
                    value={editData.empreendimento || ''}
                    onChange={(e) => setEditData({...editData, empreendimento: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="vert">VERT</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número da Unidade</label>
                  <input
                    type="text"
                    value={editData.unidadeNumero || ''}
                    onChange={(e) => setEditData({...editData, unidadeNumero: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                {editData.empreendimento?.toLowerCase() === 'vert' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor do Sinal</label>
                      <input
                        type="text"
                        value={editData.valorSinal || ''}
                        onChange={(e) => setEditData({...editData, valorSinal: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 50.000,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor das Mensais</label>
                      <input
                        type="text"
                        value={editData.valorMensais || ''}
                        onChange={(e) => setEditData({...editData, valorMensais: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 2.500,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parcelas Mensais</label>
                      <input
                        type="number"
                        value={editData.parcelasMensais || ''}
                        onChange={(e) => setEditData({...editData, parcelasMensais: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 36"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor do Semestral</label>
                      <input
                        type="text"
                        value={editData.valorSemestral || ''}
                        onChange={(e) => setEditData({...editData, valorSemestral: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 15.000,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parcelas Semestrais</label>
                      <input
                        type="number"
                        value={editData.parcelasSemestrais || ''}
                        onChange={(e) => setEditData({...editData, parcelasSemestrais: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 6"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor das Chaves</label>
                      <input
                        type="text"
                        value={editData.valorChaves || ''}
                        onChange={(e) => setEditData({...editData, valorChaves: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 100.000,00"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor do Imóvel</label>
                      <input
                        type="text"
                        value={editData.valorImovel || ''}
                        onChange={(e) => setEditData({...editData, valorImovel: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 350.000,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor da Entrada</label>
                      <input
                        type="text"
                        value={editData.valorEntrada || ''}
                        onChange={(e) => setEditData({...editData, valorEntrada: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 70.000,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor a Financiar</label>
                      <input
                        type="text"
                        value={editData.valorFinanciar || ''}
                        onChange={(e) => setEditData({...editData, valorFinanciar: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Ex: 280.000,00"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
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
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm">✓ Anexado</span>
                        <a
                          href={`/api/admin/documents/${proposta.id}/${arquivo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          title="Visualizar documento"
                        >
                          👁️ Ver
                        </a>
                        <a
                          href={`/api/admin/documents/${proposta.id}/${arquivo.name}?download=1`}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          title="Baixar documento"
                          download={arquivo.name}
                        >
                          📥 Download
                        </a>
                      </div>
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
          {(proposta.dados_conjuge || editing) && (
            <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cônjuge</h3>
              {!editing ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.nomeConjuge || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CPF</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.cpfConjuge || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">RG</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.rgConjuge || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.emailConjuge || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.telefoneCelularConjuge || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Profissão</dt>
                    <dd className="text-sm text-gray-900">{proposta.dados_conjuge?.profissaoConjuge || 'N/A'}</dd>
                  </div>
                </dl>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome do Cônjuge</label>
                    <input
                      type="text"
                      value={editData.nomeConjuge || ''}
                      onChange={(e) => setEditData({...editData, nomeConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF do Cônjuge</label>
                    <input
                      type="text"
                      value={editData.cpfConjuge || ''}
                      onChange={(e) => setEditData({...editData, cpfConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">RG do Cônjuge</label>
                    <input
                      type="text"
                      value={editData.rgConjuge || ''}
                      onChange={(e) => setEditData({...editData, rgConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Órgão Expedidor</label>
                    <input
                      type="text"
                      value={editData.orgaoExpedidorConjuge || ''}
                      onChange={(e) => setEditData({...editData, orgaoExpedidorConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sexo</label>
                    <select
                      value={editData.sexoConjuge || ''}
                      onChange={(e) => setEditData({...editData, sexoConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                    <input
                      type="date"
                      value={editData.dataNascimentoConjuge || ''}
                      onChange={(e) => setEditData({...editData, dataNascimentoConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Naturalidade</label>
                    <input
                      type="text"
                      value={editData.naturalidadeConjuge || ''}
                      onChange={(e) => setEditData({...editData, naturalidadeConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nacionalidade</label>
                    <input
                      type="text"
                      value={editData.nacionalidadeConjuge || ''}
                      onChange={(e) => setEditData({...editData, nacionalidadeConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <input
                      type="text"
                      value={editData.telefoneCelularConjuge || ''}
                      onChange={(e) => setEditData({...editData, telefoneCelularConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <input
                      type="email"
                      value={editData.emailConjuge || ''}
                      onChange={(e) => setEditData({...editData, emailConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profissão</label>
                    <input
                      type="text"
                      value={editData.profissaoConjuge || ''}
                      onChange={(e) => setEditData({...editData, profissaoConjuge: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
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