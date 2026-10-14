import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BookOpen, Award, TrendingUp, Target, Calendar, Clock, CheckCircle, AlertCircle, RotateCcw, GraduationCap, BarChart3, Sparkles, ChevronRight, Zap, Star } from 'lucide-react';

const typeConfig = {
  'QCM': { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'Contrôle': { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  'Examen final': { color: 'from-red-500 to-rose-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [scheduledExams, setScheduledExams] = useState([]);
  const [resultsPage, setResultsPage] = useState(1);
  const resultsPerPage = 5;
  useEffect(() => {
    if (!user) return;
    loadStudentData();
  }, [user?.id, user?.role]);
  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [resultsRes, examsRes, subjectsRes, scheduledRes, upcomingRes] = await Promise.all([
        api.getUserResults(user.id).catch(() => []),
        api.getExams().catch(() => []),
        api.getSubjects().catch(() => []),
        api.getScheduledExams().catch(() => []),
        api.getUpcomingDatedExams().catch(() => [])
      ]);
      setResults(resultsRes);
      setResultsPage(1);
      setExams(examsRes);
      setSubjects(subjectsRes);
      const allScheduled = [
        ...scheduledRes,
        ...examsRes.map(e => ({
          id: e.id || e._id, title: e.title, subject: e.subject, startDate: e.examDate,
          duration: e.duration, type: e.type, hasRetake: e.hasRetake, status: 'SCHEDULED'
        })),
        ...upcomingRes.map(e => ({
          id: e.id || e._id, title: e.title, subject: e.subject, startDate: e.examDate,
          duration: e.duration, type: e.type, hasRetake: e.hasRetake, status: 'SCHEDULED'
        }))
      ];
      const seen = new Set();
      setScheduledExams(allScheduled.filter(e => { const k = e.id || e._id; if (seen.has(k)) return false; seen.add(k); return true; }));
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValidated = user?.validated === true;
  const accountStatus = user?.status || 'Non validé';

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mx-auto mb-6 animate-pulse shadow-xl" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement de votre tableau de bord...</p>
      </div>
    </div>
  );

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-10 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Compte en attente de validation</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Votre a été créé avec succès, mais il doit être validé par un administrateur avant que vous puissiez accéder à la plateforme.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 mb-8 space-y-3 text-left">
            {[
              { label: 'Email', value: user?.email, icon: BookOpen },
              { label: 'Rôle', value: 'Étudiant', icon: GraduationCap },
              { label: 'Statut', value: 'En attente', icon: AlertCircle },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary w-full">Rafraîchir la page</button>
        </div>
      </div>
    );
  }

  const effectivePass = (r) => r.gradedPassed != null ? r.gradedPassed : r.passed;
  const examPassMap = {};
  results.forEach(r => {
    const eid = r.examId;
    if (!(eid in examPassMap) || effectivePass(r)) {
      examPassMap[eid] = effectivePass(r);
    }
  });
  const uniquePassed = Object.values(examPassMap).filter(v => v).length;
  const uniqueFailed = Object.values(examPassMap).filter(v => !v).length;
  const passedCount = uniquePassed;
  const failedCount = uniqueFailed;
  const uniqueExamCount = Object.keys(examPassMap).length;
  const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  const completedIds = new Set(results.map(r => r.examId));
  const availableExams = exams.filter(e => !completedIds.has(e._id || e.id));

  const statCards = [
    { title: 'Examens passés', value: uniqueExamCount, icon: BookOpen, bg: 'blue', subtext: 'Au total' },
    { title: 'Réussis', value: passedCount, icon: Award, bg: 'green', subtext: `${uniqueExamCount ? Math.round(passedCount/uniqueExamCount*100) : 0}% de réussite`, positive: passedCount > 0 },
    { title: 'Score moyen', value: `${avgScore}%`, icon: TrendingUp, bg: 'purple', subtext: `${failedCount} échec${failedCount > 1 ? 's' : ''}`, positive: avgScore >= 60 },
    { title: 'Disponibles', value: availableExams.length, icon: Target, bg: 'teal', subtext: 'Examens à passer' },
  ];

  const StatusBadge = ({ status }) => {
    const config = {
      'Validé': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle },
      'Non validé': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: Clock },
      'Absent': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
      'Rattrapage': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: RotateCcw },
    };
    const c = config[status] || config['Non validé'];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
        <Icon className="w-3.5 h-3.5" />{status}
      </span>
    );
  };

  const ExamTypeBadge = ({ type }) => {
    const cfg = typeConfig[type] || typeConfig['QCM'];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>{type || 'QCM'}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 pt-12 pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in-up">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4 border border-white/10">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                {accountStatus === 'Validé' ? 'Compte actif' : `Statut: ${accountStatus}`}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                Bonjour, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">{user?.name?.split(' ')[0] || 'Utilisateur'}</span> !
              </h1>
              <p className="text-lg text-blue-200/80">Voici votre tableau de bord étudiant</p>
            </div>
            <div className="mt-6 md:mt-0">
              <StatusBadge status={accountStatus} />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {statCards.map((stat, idx) => (
            <div key={idx} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.bg}-500 to-${stat.bg === 'blue' ? 'cyan' : stat.bg === 'green' ? 'emerald' : stat.bg === 'purple' ? 'pink' : 'cyan'}-500`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : stat.positive === false ? 'text-red-500' : 'text-slate-500'}`}>
                    {stat.positive && <span>↑</span>}
                    {stat.positive === false && <span>↓</span>}
                    {stat.subtext}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${stat.bg}-500 to-${stat.bg === 'blue' ? 'cyan' : stat.bg === 'green' ? 'emerald' : stat.bg === 'purple' ? 'pink' : 'cyan'}-500 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-${stat.bg}-500 to-${stat.bg === 'blue' ? 'cyan' : stat.bg === 'green' ? 'emerald' : stat.bg === 'purple' ? 'pink' : 'cyan'}-500 opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {subjects.length > 0 && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Mes matières
                </h2>
                <Link to="/results" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="w-4 h-4" />
                </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(subject => (
                    <div key={subject.id} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <h3 className="font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subject.code}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{subject.credits} crédits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" /> Examens programmés
                </h2>
                <Link to="/exams" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Voir tous <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {scheduledExams.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aucun examen programmé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledExams.slice(0, 5).map((exam, idx) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/30 dark:to-slate-700/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exam.type ? (typeConfig[exam.type]?.color || 'from-blue-500 to-cyan-500') : 'from-blue-500 to-cyan-500'} flex items-center justify-center shrink-0 shadow-lg`}>
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                            {exam.type && <ExamTypeBadge type={exam.type} />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(exam.startDate).toLocaleDateString('fr-FR')}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} min</span>
                            {exam.hasRetake && <span className="flex items-center gap-1 text-orange-500"><RotateCcw className="w-3 h-3" />Rattrapage</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 ml-4 px-3 py-1.5 rounded-full text-xs font-bold ${
                        exam.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        exam.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        exam.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {exam.status === 'SCHEDULED' ? 'Programmé' : exam.status === 'IN_PROGRESS' ? 'En cours' : exam.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" /> Mes résultats
                </h2>
                <Link to="/results" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Voir tous <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Vous n'avez pas encore passé d'examen.</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Commencez dès maintenant !</p>
                  <Link to="/exams" className="btn-primary inline-flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Commencer maintenant
                  </Link>
                </div>
              ) : (
                <>
                <div className="space-y-3">
                  {results.slice(0, resultsPage * resultsPerPage).map((r, idx) => (
                      <div key={r._id || r.id} onClick={() => navigate(`/results/${r._id || r.id}`)} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-700/30 dark:to-slate-700/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${r.gradedPassed != null ? (r.gradedPassed ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-rose-500') : (r.passed ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-rose-500')}`}>
                            {r.gradedPassed != null ? (r.gradedPassed ? <CheckCircle className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />) : (r.passed ? <CheckCircle className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.exam?.title || 'Examen'}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            {r.flaggedForCheating && Array.isArray(r.answers) && r.answers.length > 0 ? (
                              <p className="text-xs text-red-600 font-bold mt-1">Fraude - Non validé</p>
                            ) : r.status === 'PENDING_REVIEW' && (
                              <p className="text-xs text-amber-600 font-bold mt-1">En attente de correction</p>
                            )}
                            {r.isRetake && (
                              <p className="text-xs text-orange-600 font-bold mt-1">Rattrapage</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {r.grade != null && (
                            <span className="text-lg font-black text-purple-600">{r.grade}/20</span>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                  ))}
                </div>
                {results.length > resultsPerPage && (
                  <div className="flex justify-center mt-6">
                    {resultsPage * resultsPerPage < results.length ? (
                      <button onClick={() => setResultsPage(p => p + 1)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-200 transition-all shadow-sm">
                        Afficher plus ({results.length - resultsPage * resultsPerPage} restants)
                      </button>
                    ) : (
                      <button onClick={() => setResultsPage(1)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm">
                        Réduire
                      </button>
                    )}
                  </div>
                )}
                </>
              )}
            </section>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> Mon statut
              </h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border-2 ${
                  accountStatus === 'Validé' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                  accountStatus === 'Non validé' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                  accountStatus === 'Absent' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={accountStatus} />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Progression</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{results.length}/{exams.length || 1}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${exams.length ? Math.round((results.length / exams.length) * 100) : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
            {scheduledExams.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 animate-fade-in-up">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" /> Prochain examen
                </h3>
                {scheduledExams
                  .filter(e => new Date(e.startDate) > new Date())
                  .slice(0, 1)
                  .map(exam => (
                    <div key={exam.id} className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-2xl p-5 text-white">
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg">{exam.title}</h4>
                          {exam.type && <ExamTypeBadge type={exam.type} />}
                        </div>
                        <p className="text-white/70 text-sm mb-3">{exam.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-white/80">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(exam.startDate).toLocaleDateString('fr-FR')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{exam.duration} min</span>
                          {exam.hasRetake && <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />Rattrapage</span>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
