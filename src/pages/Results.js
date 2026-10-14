import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Results = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState(state?.result || null);
  const [exam, setExam] = useState(state?.exam || null);
  const reasonFromState = state?.reason;
  const isFraud = useMemo(() => result?.flaggedForCheating || (reasonFromState && reasonFromState.includes('Fraude')), [result, reasonFromState]);
  const [loading, setLoading] = useState(!state?.result);
  const [grade, setGrade] = useState(result?.grade ?? '');
  const [decision, setDecision] = useState('admis');
  const [comment, setComment] = useState(result?.teacherComment || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const loadedRef = useRef(false);

  const canGrade = user?.role === 'TEACHER' || user?.role === 'PROFESSOR' || user?.role === 'ADMIN';
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchResult = () => {
      api.getResult(id).then(async data => {
        if (cancelled) return;
        setResult(data);
        if (!loadedRef.current) {
          loadedRef.current = true;
          setGrade(data.grade ?? '');
          setDecision(data.gradedPassed ? 'admis' : data.isRetake ? 'refuse' : data.retakeAvailable ? 'rattrapage' : 'refuse');
          setComment(data.teacherComment || '');
        }
        const eId = typeof data.examId === 'string' ? data.examId : data.examId?.id || data.examId?._id;
        if (eId) {
          try {
            const e = await api.getExam(eId);
            if (!cancelled) setExam(e);
          } catch (e) { }
        }
      }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    };
    setLoading(true);
    fetchResult();
    const interval = setInterval(fetchResult, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const passed = decision === 'admis';
      const retakeVal = decision === 'rattrapage';
      const updated = await api.gradeResult(result.id || result._id, parseInt(grade), passed, comment, retakeVal);
      setResult(updated);
      setSaved(true);
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 animate-pulse shadow-xl" />
        <p className="text-slate-500 font-medium">Chargement...</p>
      </div>
    </div>
  );

  if (!result) return (
    <div className="text-center py-16">
      <p className="text-gray-400 mb-4">Résultats non disponibles</p>
      <button onClick={() => navigate('/exams')} className="btn-primary">Retour aux examens</button>
    </div>
  );

  const fraudFailed = isFraud && Array.isArray(result.answers) && result.answers.length > 0;

  if (result.status === "PENDING_REVIEW" && !canGrade && !fraudFailed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        {isFraud ? (
          <div className="text-6xl mb-6">⚠️</div>
        ) : (
          <div className="text-8xl mb-6 animate-float">⏳</div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">En attente de correction</h1>
        <p className="text-lg text-gray-500 mb-2">Votre copie a été transmise au professeur.</p>
        <p className="text-md text-gray-400 mb-8">Vous recevrez votre note dès que le professeur aura corrigé votre travail.</p>
        {isFraud && (
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium mb-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Une activité suspecte a été détectée pendant votre examen. Le professeur examinera votre copie.
          </div>
        )}
        {result.teacherComment && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👨‍🏫</span>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Commentaire du professeur</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.teacherComment}</p>
              </div>
            </div>
          </div>
        )}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
          <span className="text-xl">👨‍🏫</span>
          Correction en cours par le professeur
        </div>
        <div className="mt-8">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Retour au tableau de bord</button>
        </div>
      </div>
    );
  }

  const isQCM = exam?.type === 'QCM' || (!exam?.type && result.answers?.length > 0);
  const effectivePassed = fraudFailed ? false : (result.gradedPassed != null ? result.gradedPassed : result.passed);
  const autoCorrect = result.answers?.filter((a, i) => a === result.correctAnswers?.[i]).length || 0;
  const totalQ = isQCM ? (exam?.questions?.length || result.correctAnswers?.length || 0) : (exam?.openQuestions?.length || result.textAnswers?.length || 0);
  const autoScore = isQCM && totalQ > 0 ? Math.round((autoCorrect / totalQ) * 100) : result.score || 0;
  const displayGrade = fraudFailed ? 0 : (result.grade != null ? (result.grade > 20 ? Math.round(result.grade / 5) : result.grade) : null);
  const examTypeLabel = exam?.type || 'Examen';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className={`card text-center mb-8 border-t-8 transition-all ${effectivePassed ? 'border-t-green-500 bg-white' : 'border-t-red-500 bg-white'}`}>
        <div className="text-7xl mb-4">{effectivePassed ? '🏆' : '📚'}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {fraudFailed
            ? `❌ Fraude détectée — ${examTypeLabel} Non Validé`
            : result.gradedPassed != null
              ? (result.gradedPassed ? '✅ Validé par le professeur' : `❌ Refusé par le professeur`)
              : (result.passed ? `${examTypeLabel} Réussi !` : `${examTypeLabel} Non Validé`)}
        </h1>
        <p className="text-gray-600 text-lg mb-6">{exam?.title || examTypeLabel}</p>
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
            {isFraud && (
              <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700">⚠ Tentative de fraude détectée</p>
                  <p className="text-sm text-red-600 mt-0.5">
                    {fraudFailed
                      ? 'Vous avez navigué hors de l\'examen pendant un QCM. La fraude a été automatiquement détectée et l\'examen est non validé.'
                      : 'Cet étudiant a été détecté en train de naviguer hors de l\'examen. Veuillez examiner attentivement et prendre une décision.'}
                  </p>
                </div>
              </div>
            )}
            {displayGrade != null ? (
              <div>
                <p className={`text-6xl font-black ${effectivePassed ? 'text-purple-600' : 'text-red-600'}`}>
                  {displayGrade}/20
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Note du professeur</p>
              </div>
            ) : isQCM ? (
              <div>
                <p className={`text-6xl font-black ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{autoScore}%</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Score automatique</p>
              </div>
            ) : (
              <div>
                <p className="text-6xl font-black text-gray-400">—</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">En attente de notation</p>
              </div>
            )}
            {isQCM && (<>
            <div className="hidden sm:block w-px h-16 bg-gray-200" />
            <div>
              <p className="text-4xl font-bold text-gray-800">{autoCorrect}/{totalQ}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Réponses Correctes</p>
            </div>
            </>)}
            <div className="hidden sm:block w-px h-16 bg-gray-200" />
            <div>
              <p className="text-4xl font-bold text-gray-800">
                {displayGrade != null ? (
                  <span className="text-purple-600">{displayGrade >= 10 ? '≥ 10/20' : '< 10/20'}</span>
                ) : (
                  <>{Math.round((exam?.passingScore || 60) / 5)}/20</>
                )}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                {displayGrade != null ? 'Seuil professeur' : 'Score Requis'}
              </p>
            </div>
          </div>
        {result.gradedPassed != null && (
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-4 ${result.gradedPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.gradedPassed ? '✓ Admis par le professeur' : '✗ Refusé par le professeur'}
          </div>
        )}
        {isFraud && result.status === 'PENDING_REVIEW' && !fraudFailed && (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-4 bg-red-100 text-red-700">
            ⚠ En attente de décision — fraude suspectée
          </div>
        )}
        {fraudFailed && (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-4 bg-red-100 text-red-700">
            ⚠ Fraude détectée — examen automatiquement non validé
          </div>
        )}
        {result.isRetake && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 mb-4">
            <RotateCcw className="w-3.5 h-3.5" /> Rattrapage
          </div>
        )}
        {(result.teacherComment || comment) && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👨‍🏫</span>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Commentaire du professeur</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.teacherComment || comment}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {canGrade && result.status === "PENDING_REVIEW" && (
        <div className="card mb-8 border-t-4 border-t-purple-500">
          {isFraud && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">⚠ Tentative de fraude détectée</p>
                <p className="text-sm text-red-600 mt-0.5">Cet étudiant a navigué hors de l'examen. Prenez votre décision en conséquence.</p>
              </div>
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📝</span> Corriger et noter cet examen
          </h3>
          <form onSubmit={handleGradeSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">Décision</label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold ${decision === 'admis' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="profDecision" checked={decision === 'admis'} onChange={() => setDecision('admis')} className="sr-only" />
                  ✅ Admis
                </label>
                <label className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold ${decision === 'refuse' ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="profDecision" checked={decision === 'refuse'} onChange={() => setDecision('refuse')} className="sr-only" />
                  ❌ Refusé
                </label>
                {exam?.type !== 'Contrôle' && !result.isRetake && (
                <label className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold ${decision === 'rattrapage' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 text-gray-500'}`}>
                  <input type="radio" name="profDecision" checked={decision === 'rattrapage'} onChange={() => setDecision('rattrapage')} className="sr-only" />
                  🔄 Rattrapage
                </label>)}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Note sur 20</label>
                <input type="number" min="0" max="20" required
                  className="input text-2xl font-bold w-32 text-center"
                  value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              <button type="submit" disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg">
                {saving ? 'Enregistrement...' : '💾 Enregistrer la note'}
              </button>
              {saved && <span className="text-green-600 font-bold text-sm animate-pulse">✓ Noté !</span>}
            </div>
            <div>
              <textarea className="input" rows="2" value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Ajoutez un commentaire pour l'étudiant..." />
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Correction détaillée</h2>
            <span className="text-sm text-gray-500">{totalQ} question{totalQ > 1 ? 's' : ''}</span>
          </div>
          {isQCM ? (
          <>
            {exam?.questions?.map((q, i) => {
              const ua = result.answers?.[i];
              const isC = ua === result.correctAnswers?.[i];
              return (
                <div key={i} className={`p-5 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md ${isC ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${isC ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-3">{q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options?.map((opt, j) => {
                          const isUC = ua === j;
                          const isCC = result.correctAnswers?.[i] === j;
                          let cls = 'text-sm px-4 py-2.5 rounded-md border flex justify-between items-center ';
                          if (isCC) cls += 'border-green-200 bg-green-50 text-green-800 font-semibold';
                          else if (isUC && !isC) cls += 'border-red-200 bg-red-50 text-red-800';
                          else cls += 'border-gray-100 text-gray-600 bg-gray-50/50';
                          return (
                            <div key={j} className={cls}>
                              <span>{String.fromCharCode(65 + j)}. {opt}</span>
                              {isCC && <span className="text-green-600">✓</span>}
                              {isUC && !isC && <span className="text-red-500">✗</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
          ) : (
          <>
            {exam?.openQuestions?.map((q, i) => (
              <div key={i} className="p-5 rounded-lg border-l-4 border-l-blue-400 bg-white shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700">{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-3">{q.text}</p>
                    <div className="text-sm p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Votre réponse</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{result.textAnswers?.[i] || <span className="italic text-gray-400">Aucune réponse</span>}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
          )}
        </div>
        <div className="space-y-6">
          <div className="card sticky top-24">
            {result.retakeAvailable && !result.isRetake && !canGrade && !result.retakeAlreadyTaken && (
              <button onClick={() => navigate(`/exams/${exam?.id || exam?._id || ''}`)}
                className="w-full py-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold mb-3 transition-all">
                <RotateCcw className="w-5 h-5" /> Passer le rattrapage
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-4">Retour au tableau de bord</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
