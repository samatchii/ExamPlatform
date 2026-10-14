import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../../components/Common';
import { useAuth } from '../../context/AuthContext';

const AllResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.getAllResults()
      .then(setResults)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce résultat ?')) return;
    try {
      await api.deleteResult(id);
      load();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    }
  };

  const effectivePassed = (r) => r.gradedPassed != null ? r.gradedPassed : r.passed;
  const isFraudAutoFail = (r) => r.flaggedForCheating && Array.isArray(r.answers) && r.answers.length > 0;
  const statusLabel = (r) => {
    if (r.status === 'PENDING_REVIEW' && isFraudAutoFail(r)) return { label: 'Fraude - Non validé', cls: 'bg-red-100 text-red-700 border-red-200' };
    if (r.status === 'PENDING_REVIEW') return { label: 'En attente', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (effectivePassed(r)) return { label: 'Admis ✓', cls: 'bg-green-100 text-green-700 border-green-200' };
    return { label: 'Pas admis ✗', cls: 'bg-red-100 text-red-700 border-red-200' };
  };

  const filtered = filterStatus === 'all'
    ? results
    : results.filter(r => {
        if (filterStatus === 'pending') return r.status === 'PENDING_REVIEW' && !isFraudAutoFail(r);
        if (filterStatus === 'passed') return effectivePassed(r);
        if (filterStatus === 'failed') return !effectivePassed(r);
        return true;
      });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const goPage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  useEffect(() => { setPage(1); }, [filterStatus]);

  if (loading) return <Spinner />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Résultats des examens</h2>
          <p className="text-sm text-gray-500">Tous les résultats avec décision professeur</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400">
            <option value="all">Tous ({results.length})</option>
            <option value="pending">En attente ({results.filter(r => r.status === 'PENDING_REVIEW' && !isFraudAutoFail(r)).length})</option>
            <option value="passed">Admis ({results.filter(r => effectivePassed(r)).length})</option>
            <option value="failed">Pas admis ({results.filter(r => !effectivePassed(r)).length})</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <th className="px-6 py-4">Étudiant</th>
              <th className="px-6 py-4">Examen</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Note</th>
              <th className="px-6 py-4">Décision</th>
              <th className="px-6 py-4">Professeur</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((r) => {
              const st = statusLabel(r);
              return (
                <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {r.user?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{r.user?.name || 'Inconnu'}</p>
                        <p className="text-[10px] text-gray-400">{r.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{r.examId?.title || 'Examen supprimé'}</p>
                    <p className="text-[10px] text-gray-400">{r.examId?.type}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    {r.grade != null ? (
                      <span className="text-sm font-bold text-purple-600">{r.grade > 20 ? Math.round(r.grade / 5) : r.grade}/20</span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.grade != null && r.gradedBy ? 'Professeur' : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => navigate(`/results/${r._id}`)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        Voir
                      </button>
                      <button onClick={() => handleDelete(r._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic">Aucun résultat trouvé.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} — Page {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => goPage(page - 1)} disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => goPage(p)}
                className={`w-8 h-8 text-sm font-bold rounded-lg transition-all ${p === page ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => goPage(page + 1)} disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllResults;
