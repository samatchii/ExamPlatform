import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Spinner } from '../components/Common';
import SecureExamWrapper from '../components/SecureExamWrapper';

const Timer = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const urgent = remaining < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${urgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
      ⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
};

const TakeExam = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [violations, setViolations] = useState(0);
  const [violationMsg, setViolationMsg] = useState(null);
  const [serverRemaining, setServerRemaining] = useState(null);
  const lastSave = useRef(Date.now());
  const submitRef = useRef(null);
  const submittingRef = useRef(false);

  const isQCM = exam?.type === 'QCM';
  const questionsList = React.useMemo(
    () => isQCM ? (exam?.questions || []) : (exam?.openQuestions || []),
    [isQCM, exam?.questions, exam?.openQuestions]
  );

  const buildAnswerArrays = useCallback(() => {
    if (isQCM) {
      return {
        answersArray: questionsList.map((_, i) => answers[i] ?? -1),
        textAnswersArray: []
      };
    }
    return {
      answersArray: [],
      textAnswersArray: questionsList.map((_, i) => textAnswers[i] || '')
    };
  }, [isQCM, questionsList, answers, textAnswers]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      if (submittingRef.current) return;
      const { answersArray, textAnswersArray } = buildAnswerArrays();
      try {
        await api.saveExamAnswers(sessionId, answersArray, textAnswersArray);
        lastSave.current = Date.now();
      } catch (e) { /* silent */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionId, buildAnswerArrays]);

  useEffect(() => {
    if (!id || id === 'undefined' || !user?.id) {
      setLoading(false);
      return;
    }
    const init = async () => {
      try {
        const examData = await api.getExam(id);
        setExam(examData);
        const session = await api.startExamSession(id);
        setSessionId(session.id || session._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, user]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      if (submittingRef.current) return;
      try {
        const status = await api.getExamSession(sessionId);
        setServerRemaining(status.remaining);
        if (status.status !== 'EN_COURS' && submitRef.current) {
          submitRef.current();
        }
      } catch (e) { /* silent */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const finalSubmit = useCallback(async (reason) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    if (submitting) return;
    setSubmitting(true);

    const { answersArray, textAnswersArray } = buildAnswerArrays();

    try {
      if (sessionId) {
        await api.endExamSession(sessionId, answersArray, textAnswersArray);
      }

      let score = 0;
      let passed = false;
      let correctAnswers = [];
      let finalAnswers = [];

      if (isQCM) {
        let correct = 0;
        exam.questions.forEach((q, i) => {
          if (answers[i] === q.correct) correct++;
        });
        score = Math.round((correct / exam.questions.length) * 100);
        passed = score >= (exam.passingScore || 60);
        correctAnswers = exam.questions.map(q => q.correct);
        finalAnswers = exam.questions.map((_, i) => answers[i] ?? -1);
      }

      const result = await api.submitExam(
        exam._id || id, score, passed, finalAnswers, correctAnswers, user?.id, textAnswersArray
      );
      navigate(`/results/${result._id || result.id}`, { state: { result, exam, reason } });
    } catch (err) {
      console.error(err);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [submitting, sessionId, buildAnswerArrays, isQCM, exam, answers, id, user, navigate, textAnswers]);

  const handleSubmit = useCallback(() => finalSubmit(), [finalSubmit]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  const handleViolation = useCallback((type, count) => {
    setViolations(count);
    setViolationMsg(`⚠ ${type} détecté — ${count}/3 avertissements`);
    setTimeout(() => setViolationMsg(null), 4000);
  }, []);

  const handleTerminated = useCallback((reason) => {
    finalSubmit(reason);
  }, [finalSubmit]);

  const currentRemaining = serverRemaining != null ? serverRemaining : (exam ? exam.duration * 60 : 0);

  if (loading) return <Spinner />;
  if (!exam) return <div className="text-center py-16">Examen non trouvé</div>;
  if (questionsList.length === 0)
    return <div className="text-center py-16 text-gray-500">Cet examen ne contient pas encore de questions.</div>;

  const q = questionsList[current];
  const answered = isQCM
    ? Object.keys(answers).length
    : Object.keys(textAnswers).filter(k => textAnswers[k]?.trim()).length;
  const progress = questionsList.length > 0 ? (answered / questionsList.length) * 100 : 0;

  return (
    <SecureExamWrapper sessionId={sessionId} onViolation={handleViolation} onTerminated={handleTerminated} isSubmitting={submitting}>
      {violationMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {violationMsg}
        </div>
      )}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{exam.title}</h1>
            <p className="text-xs text-gray-500">{answered}/{questionsList.length} réponses</p>
          </div>
          <div className="flex items-center gap-3">
            {violations > 0 && (
              <span className="text-xs font-bold text-red-600">{violations}/3 fraudes</span>
            )}
            <Timer seconds={currentRemaining} onExpire={() => handleTerminated('Temps écoulé')} />
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex gap-6">
        <div className="flex-1">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">Q{current + 1}</span>
              <span className="text-sm text-gray-400">sur {questionsList.length}</span>
            </div>
            <p className="text-gray-900 font-medium text-lg mb-6">{q.text}</p>

            {isQCM ? (
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers({ ...answers, [current]: i })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[current] === i ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-bold mr-3 ${answers[current] === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="input w-full min-h-[120px] resize-y"
                placeholder="Saisissez votre réponse..."
                value={textAnswers[current] || ''}
                onChange={e => setTextAnswers({ ...textAnswers, [current]: e.target.value })}
              />
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}
              className="btn-secondary disabled:opacity-40">← Précédent</button>
            {current < questionsList.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">Suivant →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                {submitting ? 'Envoi...' : '✓ Soumettre'}
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-48">
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">Navigation</p>
            <div className="grid grid-cols-4 gap-2">
              {questionsList.map((_, i) => {
                const isAnswered = isQCM ? answers[i] !== undefined : textAnswers[i]?.trim();
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${i === current ? 'bg-blue-600 text-white' : isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600" /> Actuelle</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Répondue</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Non répondue</div>
            </div>
          </div>
        </div>
      </div>
    </SecureExamWrapper>
  );
};

export default TakeExam;
