'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Proposta {
  id: string;
  dados_pessoais: any;
  empreendimento: any;
  status: string;
  pdf_gerado: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const router = useRouter();

  const loadPropostas = async () => {
    try {
      const offset = page * limit;
      const response = await fetch(`/api/propostas?dashboard=true&limit=${limit}&offset=${offset}`);
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      const data = await response.json();
      setPropostas(data.propostas);
      setTotal(data.total);
      setSelectedItems([]); // Limpar seleção ao carregar nova página
    } catch (error) {
      console.error('Erro ao carregar propostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta proposta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/propostas?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadPropostas();
      } else {
        alert('Erro ao deletar proposta');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar proposta');
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === propostas.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(propostas.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos uma proposta para deletar');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar ${selectedItems.length} proposta(s) selecionada(s)?`)) {
      return;
    }

    setBulkActionLoading(true);
    
    try {
      const response = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Exclusão concluída: ${data.success} sucesso, ${data.failed} falhas`);
        await loadPropostas();
      } else {
        alert(`Erro na exclusão em lote: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro na exclusão em lote:', error);
      alert('Erro na exclusão em lote');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  useEffect(() => {
    loadPropostas();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando propostas...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Lotus</h1>
              <p className="text-gray-600">Gestão de Propostas</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">{total}</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Propostas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {total} propostas cadastradas
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedItems.length} item(s) selecionado(s)
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Limpar seleção
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Deletando...' : '🗑️ Deletar Selecionados'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Propostas
            </h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={propostas.length > 0 && selectedItems.length === propostas.length}
                  onChange={handleSelectAll}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Selecionar todos
              </label>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {propostas.map((proposta) => (
              <li key={proposta.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(proposta.id)}
                        onChange={() => handleSelectItem(proposta.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-yellow-600 truncate">
                            {proposta.dados_pessoais?.nome || 'Nome não informado'}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              proposta.status === 'concluida' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {proposta.status}
                            </p>
                          </div>
                        </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Empreendimento: {proposta.empreendimento?.empreendimento || 'N/A'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            PDF: {proposta.pdf_gerado ? '✅ Gerado' : '❌ Não gerado'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {formatDate(proposta.created_at)}
                          </p>
                        </div>
                      </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <Link
                        href={`/admin/dashboard/proposta/${proposta.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Ver
                      </Link>
                      {proposta.pdf_gerado && (
                        <div className="flex space-x-1">
                          <a
                            href={`/api/admin/pdf/${proposta.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            title="Visualizar PDF"
                          >
                            👁️
                          </a>
                          <a
                            href={`/api/admin/download/${proposta.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                            title="Baixar PDF"
                          >
                            📥
                          </a>
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(proposta.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {total > limit && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * limit >= total}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{page * limit + 1}</span> até{' '}
                    <span className="font-medium">{Math.min((page + 1) * limit, total)}</span> de{' '}
                    <span className="font-medium">{total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={(page + 1) * limit >= total}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {propostas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma proposta encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}