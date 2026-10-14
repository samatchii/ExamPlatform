import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LevelBadge, Spinner } from '../components/Common';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [checkingResult, setCheckingResult] = useState(true);
  const [examResults, setExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    api.getExam(id).then(setExam).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user?.id) { setCheckingResult(false); return; }
    api.getUserResults(user.id).then(results => {
      const existing = results.find(r => r.examId === id);
      setResult(existing || null);
    }).catch(() => {}).finally(() => setCheckingResult(false));
  }, [id, user]);

  useEffect(() => {
    if (!id || !user || (user.role !== 'TEACHER' && user.role !== 'PROFESSOR' && user.role !== 'ADMIN')) return;
    setLoadingResults(true);
    api.getExamResults(id).then(setExamResults).catch(() => {}).finally(() => setLoadingResults(false));
  }, [id, user]);
  const getButtonState = () => {
    if (!result) return { label: "S'inscrire gratuitement", disabled: false, onClick: () => navigate(`/exams/${id}/take`) };
    const r = result;
    const isFraudQCM = r.flaggedForCheating && Array.isArray(r.answers) && r.answers.length > 0;
    if (isFraudQCM) return { label: '✗ Non validé (fraude)', disabled: true, onClick: null };
    if (r.status === 'PENDING_REVIEW') return { label: 'En attente du professeur...', disabled: true, onClick: null };
    if (r.status === 'GRADED' && r.gradedPassed) return { label: '✓ Examen validé', disabled: true, onClick: null };
    if (r.status === 'GRADED' && !r.gradedPassed && r.retakeAvailable) return { label: 'Passer le rattrapage', disabled: false, onClick: () => navigate(`/exams/${id}/take`) };
    if (r.status === 'GRADED' && !r.gradedPassed && !r.retakeAvailable) return { label: '✗ Non validé', disabled: true, onClick: null };
    return { label: 'Commencer', disabled: false, onClick: () => navigate(`/exams/${id}/take`) };
  };

  if (loading) return <Spinner />;
  if (!exam) return <div className="text-center py-16 text-gray-400">Examen non trouvé</div>;

  const btn = getButtonState();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#00255d] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex mb-8 text-sm">
            <button onClick={() => navigate('/exams')} className="hover:underline text-blue-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Retour au catalogue
            </button>
          </nav>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  {exam.subject}
                </span>
                <LevelBadge level={exam.level} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{exam.title}</h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {exam.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">Offert par</span>
                  <span className="font-bold">ExamPlatform Academy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">Durée</span>
                  <span className="font-bold">{exam.duration} minutes</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-80 bg-white rounded-lg p-6 shadow-2xl text-gray-900 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1 font-medium">Statut</p>
                {result ? (
                  <p className={`text-lg font-bold flex items-center gap-2 ${
                    result.status === 'GRADED' && result.gradedPassed ? 'text-green-600' :
                    result.status === 'GRADED' && !result.gradedPassed ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      result.status === 'GRADED' && result.gradedPassed ? 'bg-green-600' :
                      result.status === 'GRADED' && !result.gradedPassed ? 'bg-red-600' : 'bg-amber-600 animate-pulse'
                    }`}></span>
                    {result.isRetake ? 'Rattrapage' :
                     result.status === 'GRADED' && result.gradedPassed ? 'Validé' :
                     result.status === 'GRADED' && !result.gradedPassed ? 'Non validé' : 'En cours de correction'}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Disponible
                  </p>
                )}
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Questions</span>
                  <span className="font-bold">{exam.totalQuestions} {exam.type === 'QCM' ? 'QCM' : 'questions'}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Score requis</span>
                  <span className="font-bold">{Math.round((exam.passingScore || 60) / 5)}/20</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Type</span>
                  <span className="font-bold">{exam.type === 'QCM' ? 'Auto-évalué' : 'Correction manuelle'}</span>
                </div>
              </div>
              <button
                onClick={btn.onClick}
                disabled={btn.disabled || checkingResult}
                className={`w-full py-4 text-lg mb-4 font-semibold rounded-xl transition-all ${
                  btn.disabled || checkingResult
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {checkingResult ? 'Vérification...' : btn.label}
              </button>
              {!btn.disabled && !checkingResult && (
                <p className="text-[11px] text-gray-400 text-center">
                  Commence le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              )}
              {result?.status === 'GRADED' && result.grade != null && (
                <p className="text-sm text-center mt-2 font-bold">
                  Note: {result.grade}/20
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de cet examen</h2>
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
              <p className="mb-4">
                Cet examen a été conçu pour évaluer vos connaissances approfondies en {exam.subject}. 
                Il couvre les concepts fondamentaux ainsi que des scénarios pratiques pour garantir une maîtrise complète du sujet.
              </p>
              <p>
                  En réussissant cet examen avec une note de {Math.round((exam.passingScore || 60) / 5)}/20 ou plus, vous démontrez votre expertise 
                et recevez une certification numérique partageable sur vos réseaux professionnels.
              </p>
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Compétences que vous allez valider</h2>
            <div className="flex gap-2 flex-wrap">
              {exam.tags?.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-full text-sm border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </section>
          <section className="bg-coursera-lightBlue/30 border border-coursera-blue/10 rounded-xl p-8">
            <div className="flex gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-lg font-bold text-coursera-darkBlue mb-2">Conseils pour réussir</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc ml-4">
                  <li>Lisez attentivement chaque question avant de répondre.</li>
                  <li>Gérez votre temps : vous avez environ {Math.floor(exam.duration / exam.totalQuestions)} minutes par question.</li>
                  <li>Assurez-vous d'être dans un environnement calme sans distractions.</li>
                </ul>
              </div>
            </div>
          </section>
          {(user?.role === 'TEACHER' || user?.role === 'PROFESSOR' || user?.role === 'ADMIN') && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion du statut des étudiants</h2>
              <p className="text-gray-500 text-sm mb-6">Déclarez le statut de validation des étudiants</p>
              {loadingResults ? (
                <Spinner />
              ) : examResults.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-3xl mb-2">👨‍🎓</p>
                  <p className="text-gray-400">Aucun étudiant inscrit.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <th className="px-6 py-4">Étudiant</th>
                          <th className="px-6 py-4">Statut</th>
                          <th className="px-6 py-4">Note</th>
                          <th className="px-6 py-4">Actions rapides</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {examResults.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-coursera-lightBlue text-coursera-blue flex items-center justify-center font-bold text-sm border border-blue-100">
                                  {r.userName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{r.userName}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{r.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {r.flaggedForCheating && Array.isArray(r.answers) && r.answers.length > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">❌ Fraude - Non validé</span>
                              ) : r.status === 'PENDING_REVIEW' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ En attente</span>
                              ) : r.gradedPassed ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✅ Validé</span>
                              ) : r.retakeAvailable ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">🔄 Rattrapage</span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">❌ Non validé</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {r.grade != null ? `${r.grade}/20` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => navigate(`/results/${r.id}`)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                              >
                                Corriger
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
