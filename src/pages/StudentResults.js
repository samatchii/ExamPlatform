import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, CheckCircle, AlertCircle, RotateCcw, Award, MessageSquare, Calendar, HelpCircle, BookOpen, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Spinner } from '../components/Common';

const typeConfig = {
  'QCM': { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-700' },
  'Contrôle': { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100', text: 'text-amber-700' },
  'Examen final': { color: 'from-red-500 to-rose-500', bg: 'bg-red-100', text: 'text-red-700' },
};

const StudentResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 5;
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      api.getUserResults(user.id).catch(() => []),
      api.getExams().catch(() => []),
      api.getScheduledExams().catch(() => []),
      api.getUpcomingDatedExams().catch(() => [])
    ]).then(([resultsRes, examsRes, scheduledRes, upcomingRes]) => {
      setResults(resultsRes);
      setPage(1);
      const takenIds = new Set(resultsRes.map(r => r.examId));
      const allScheduled = [
        ...scheduledRes,
        ...upcomingRes.map(e => ({
          id: e.id, _id: e._id, title: e.title, subject: e.subject,
          startDate: e.examDate, duration: e.duration, type: e.type,
          hasRetake: e.hasRetake, status: 'SCHEDULED'
        }))
      ];
      const filtered = allScheduled.filter(e => !takenIds.has(e.id || e._id));
      if (filtered.length === 0) {
        const notTaken = examsRes.filter(e => !takenIds.has(e._id || e.id));
        setAvailableExams(notTaken);
      } else {
        setAvailableExams(filtered);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const passed = (r) => r.gradedPassed != null ? r.gradedPassed : r.passed;
  const deleteResult = async (id) => {
    if (!window.confirm('Supprimer ce résultat ?')) return;
    try {
      await api.deleteResult(id);
      setResults(prev => prev.filter(r => r.id !== id && r._id !== id));
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes résultats</h1>
            <p className="text-gray-500 mt-1">{results.length} examen(s) passé(s)</p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Tableau de bord <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {results.length === 0 && availableExams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Award className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-500 font-medium">Vous n'avez pas encore passé d'examen.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" /> Résultats
                </h2>
                <div className="space-y-3">
                  {results.slice(0, page * perPage).map((r, idx) => {
                    const p = passed(r);
                    const answerCount = r.answers?.length || r.textAnswers?.length || 0;
                    const correctCount = r.answers?.filter((a, i) => a === r.correctAnswers?.[i]).length;
                    const textAnsCount = r.textAnswers?.filter(t => t?.trim())?.length;
                    const isRésultatQCM = answerCount > 0;
                    const isFraudAutoFail = r.flaggedForCheating && isRésultatQCM;
                    return (
                      <div key={r._id || r.id}
                        onClick={() => navigate(`/results/${r._id || r.id}`)}
                        className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                              r.status === 'PENDING_REVIEW' && !isFraudAutoFail ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                              p ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-rose-500'
                            }`}>
                              {r.status === 'PENDING_REVIEW' && !isFraudAutoFail ? <RotateCcw className="w-7 h-7 text-white" /> :
                               p ? <CheckCircle className="w-7 h-7 text-white" /> : <AlertCircle className="w-7 h-7 text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{r.exam?.title || 'Examen'}</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {r.gradedAt && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Noté le {new Date(r.gradedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </span>
                                )}
                                {isRésultatQCM && answerCount != null && (
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    {correctCount}/{answerCount} bonnes réponses
                                  </span>
                                )}
                                {!isRésultatQCM && textAnsCount != null && (
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    {textAnsCount} réponse{textAnsCount > 1 ? 's' : ''} libre{textAnsCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {isFraudAutoFail ? (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">Fraude - Non validé ✗</span>
                                ) : r.status === 'PENDING_REVIEW' ? (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">En attente de correction</span>
                                ) : p ? (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">Admis ✓</span>
                                ) : (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">Pas admis ✗</span>
                                )}
                                {r.isRetake && (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">Rattrapage</span>
                                )}
                                {r.retakeAvailable && !r.isRetake && r.status !== 'PENDING_REVIEW' && !p && !isFraudAutoFail && (
                                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">Rattrapage disponible</span>
                                )}
                                {r.status !== 'PENDING_REVIEW' && r.gradedPassed != null && (
                                  <span className="text-xs text-gray-400">Décision professeur</span>
                                )}
                              </div>
                              {r.teacherComment && (
                                <p className="mt-2 text-sm text-gray-600 flex items-start gap-1.5 line-clamp-2">
                                  <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                  <span className="italic">&ldquo;{r.teacherComment}&rdquo;</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {r.grade != null && (
                              <div className="text-center">
                                <span className={`text-2xl font-black ${p ? 'text-purple-600' : 'text-red-600'}`}>{r.grade}</span>
                                <span className="text-xs text-gray-400">/20</span>
                              </div>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); deleteResult(r.id || r._id); }}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {results.length > perPage && (
                  <div className="flex justify-center mt-6">
                    {page * perPage < results.length ? (
                      <button onClick={() => setPage(p => p + 1)}
                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                        Afficher plus ({results.length - page * perPage} restants)
                      </button>
                    ) : (
                      <button onClick={() => setPage(1)}
                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all shadow-sm">
                        Réduire
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {availableExams.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> Examens disponibles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableExams.map((e) => (
                    <div key={e.id || e._id}
                      onClick={() => navigate(`/exams/${e.id || e._id}`)}
                      className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${e.type ? (typeConfig[e.type]?.color || 'from-blue-500 to-cyan-500') : 'from-blue-500 to-cyan-500'} flex items-center justify-center shrink-0 shadow-lg`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{e.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{e.subject}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {e.startDate ? new Date(e.startDate).toLocaleDateString('fr-FR') : 'À venir'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {e.duration || '?'} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {e.type && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${typeConfig[e.type]?.bg || 'bg-gray-100'} ${typeConfig[e.type]?.text || 'text-gray-700'}`}>{e.type}</span>
                            )}
                            {e.hasRetake && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                <RotateCcw className="w-3 h-3" /> Rattrapage
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;
