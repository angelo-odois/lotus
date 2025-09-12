'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Proposal {
  id: string;
  clientName: string;
  attachmentCount: number;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function getCsrfToken(): string {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const router = useRouter();

  async function fetchProposals(page = 1, q = '') {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(q && { q })
      });

      const response = await fetch(`/api/proposals?${params}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar propostas');
      }

      const data = await response.json();
      setProposals(data.proposals);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(proposalId: string) {
    setApproving(proposalId);
    setError('');

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('Token CSRF não encontrado');
      }

      const response = await fetch(`/api/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ csrfToken }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao aprovar proposta');
      }

      // Update local state
      setProposals(prev => 
        prev.map(p => 
          p.id === proposalId 
            ? { ...p, status: 'approved' }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setApproving(null);
    }
  }

  async function handleDelete(proposalId: string, clientName: string) {
    if (!confirm(`Tem certeza que deseja apagar a proposta de ${clientName}?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setDeleting(proposalId);
    setError('');

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('Token CSRF não encontrado');
      }

      const response = await fetch(`/api/proposals/${proposalId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ csrfToken }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao apagar proposta');
      }

      // Atualizar a lista
      await fetchProposals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setDeleting(null);
    }
  }

  async function handleBulkDelete() {
    const deletableProposals = proposals.filter(p => 
      selectedProposals.includes(p.id) && p.status !== 'approved'
    );
    
    if (deletableProposals.length === 0) {
      setError('Nenhuma proposta selecionada pode ser apagada (propostas aprovadas não podem ser removidas)');
      return;
    }

    const clientNames = deletableProposals.map(p => p.clientName).join(', ');
    if (!confirm(`Tem certeza que deseja apagar ${deletableProposals.length} proposta(s)?\n\nClientes: ${clientNames}\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setBulkDeleting(true);
    setError('');

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('Token CSRF não encontrado');
      }

      const response = await fetch('/api/proposals/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ 
          proposalIds: selectedProposals,
          csrfToken 
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao apagar propostas');
      }

      // Limpar seleção e atualizar lista
      setSelectedProposals([]);
      await fetchProposals();
      
      // Mostrar sucesso
      if (data.skippedCount > 0) {
        setError(`${data.deletedCount} proposta(s) apagada(s). ${data.skippedCount} proposta(s) aprovada(s) não foram removidas.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleSelectAll() {
    const selectableProposals = proposals
      .filter(p => p.status !== 'approved')
      .map(p => p.id);
    
    if (selectedProposals.length === selectableProposals.length) {
      // Desmarcar todos
      setSelectedProposals([]);
    } else {
      // Selecionar todos os não aprovados
      setSelectedProposals(selectableProposals);
    }
  }

  function handleSelectProposal(proposalId: string, isApproved: boolean) {
    if (isApproved) return; // Não permite selecionar propostas aprovadas

    setSelectedProposals(prev => 
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId]
    );
  }

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProposals(1, searchQuery);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatAttachments(count: number): string {
    if (count === 0) return '—';
    return `${count} anexo${count > 1 ? 's' : ''}`;
  }

  useEffect(() => {
    fetchProposals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard de Propostas
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={80}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProposals.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedProposals.length} proposta(s) selecionada(s)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProposals([])}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded hover:bg-blue-100"
                >
                  Limpar Seleção
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
                >
                  {bulkDeleting ? '🔄 Apagando...' : '🗑️ Apagar Selecionadas'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      proposals.length > 0 && 
                      selectedProposals.length === proposals.filter(p => p.status !== 'approved').length &&
                      proposals.filter(p => p.status !== 'approved').length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={loading || proposals.every(p => p.status === 'approved')}
                    title="Selecionar todas as propostas não aprovadas"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gerada em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta disponível'}
                  </td>
                </tr>
              ) : (
                proposals.map((proposal) => (
                  <tr key={proposal.id} className={selectedProposals.includes(proposal.id) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProposals.includes(proposal.id)}
                        onChange={() => handleSelectProposal(proposal.id, proposal.status === 'approved')}
                        disabled={proposal.status === 'approved'}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        title={proposal.status === 'approved' ? 'Propostas aprovadas não podem ser selecionadas' : 'Selecionar esta proposta'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proposal.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAttachments(proposal.attachmentCount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(proposal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {/* Visualizar HTML */}
                        <a
                          href={`/api/proposals/${proposal.id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Visualizar proposta em HTML"
                        >
                          👁️ Ver
                        </a>
                        
                        {/* Download PDF */}
                        <a
                          href={`/api/proposals/${proposal.id}/pdf`}
                          download
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Download em PDF"
                        >
                          📄 PDF
                        </a>
                        
                        {/* Delete (apenas para propostas não aprovadas) */}
                        {proposal.status !== 'approved' && (
                          <button
                            onClick={() => handleDelete(proposal.id, proposal.clientName)}
                            disabled={deleting === proposal.id}
                            className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Apagar proposta"
                          >
                            {deleting === proposal.id ? '⏳' : '🗑️'} {deleting === proposal.id ? 'Apagando...' : 'Apagar'}
                          </button>
                        )}
                        
                        {/* Aprovar */}
                        {proposal.status === 'approved' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✅ Aprovada
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApprove(proposal.id)}
                            disabled={approving === proposal.id}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Aprovar proposta"
                          >
                            {approving === proposal.id ? '⏳' : '✅'} {approving === proposal.id ? 'Aprovando...' : 'Aprovar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchProposals(pagination.page - 1, searchQuery)}
                disabled={!pagination.hasPrev || loading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => fetchProposals(pagination.page + 1, searchQuery)}
                disabled={!pagination.hasNext || loading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}