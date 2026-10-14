import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Spinner } from '../../components/Common';

const colors = [
  'from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400', 'from-emerald-500 to-teal-400',
  'from-orange-500 to-rose-400', 'from-indigo-500 to-violet-400', 'from-amber-500 to-yellow-400'
];

const PendingCorrections = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.getPendingResults()
      .then(data => {
        const sorted = [...data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setResults(sorted);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette copie ?')) return;
    try {
      await api.deleteResult(id);
      load();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return <Spinner />;

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-bold text-gray-800">Aucune copie en attente</p>
        <p className="text-sm text-gray-400 mt-2">Tous les résultats ont été corrigés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{results.length} copie{results.length > 1 ? 's' : ''} en attente</p>
            <p className="text-xs text-gray-400">Correction manuelle requise</p>
          </div>
        </div>
      </div>

      {results.map((r, idx) => (
        <div key={r.id || r._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-200 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm`}>
                  {getInitials(r.student?.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">{r.student?.name || 'Étudiant inconnu'}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-medium text-gray-400">{r.student?.email}</span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: r.exam?.type === 'QCM' ? '#e0f2fe' : '#fef3c7',
                        color: r.exam?.type === 'QCM' ? '#0369a1' : '#b45309'
                      }}>
                      {r.exam?.type || 'QCM'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 ml-16 sm:ml-0">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Auto</p>
                  <div className={`text-lg font-black tabular-nums ${r.score >= 60 ? 'text-emerald-600' : r.score >= 30 ? 'text-amber-600' : 'text-red-500'}`}>
                    {r.score != null ? `${r.score}%` : '—'}
                  </div>
                </div>

                <div className="hidden md:block max-w-[180px]">
                  <p className="text-xs text-gray-400 font-medium">Examen</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{r.exam?.title || '—'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button onClick={() => handleDelete(r.id || r._id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => navigate(`/results/${r.id || r._id}`)}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.97] text-sm">
                    <span>Corriger</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingCorrections;
