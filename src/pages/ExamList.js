import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LevelBadge } from '../components/Common';
import { Search, Filter, Clock, HelpCircle, Calendar, BookOpen, ChevronRight, Sparkles, GraduationCap, AlertCircle, RotateCcw, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const typeConfig = {
  'QCM': { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '📋' },
  'Contrôle': { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '📝' },
  'Examen final': { color: 'from-red-500 to-rose-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '🎯' },
};

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuth();
  const [retakeMap, setRetakeMap] = useState({});
  useEffect(() => {
    api.getExams()
      .then(async (examsData) => {
        setExams(examsData);
        if (user?.id) {
          try {
            const results = await api.getUserResults(user.id);
            const map = {};
            results.forEach(r => {
              if (r.retakeAvailable) {
                map[r.examId] = true;
              }
              if (r.isRetake) {
                map[r.examId] = false;
              }
            });
            setRetakeMap(map);
          } catch (_) {
          }
        }
      })
      .catch(err => setError(err.message || 'Erreur de connexion au serveur.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const levels = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
  const filtered = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filter === 'Tous' || e.level === filter;
    return matchSearch && matchLevel;
  });

  const examTypeBadge = (exam) => {
    const cfg = typeConfig[exam.type] || typeConfig['QCM'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        <span>{cfg.icon}</span>
        {exam.type || 'QCM'}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 animate-pulse" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement des examens...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md animate-fade-in-up">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erreur de connexion</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          <RotateCcw className="w-4 h-4 mr-2 inline" />Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-4 border border-white/10">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                {filtered.length} examens disponibles
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Explorez nos examens</h1>
              <p className="text-lg text-blue-200/80">Testez vos connaissances et obtenez des certifications</p>
            </div>
            <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
          <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input type="text" placeholder="Que voulez-vous apprendre ?"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-lg"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-4 h-4 text-white/60 shrink-0" />
                {levels.map(l => (
                  <button key={l} onClick={() => setFilter(l)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      filter === l
                        ? 'bg-white text-slate-900 shadow-lg shadow-black/10'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium animate-fade-in">
          <BookOpen className="w-4 h-4" />
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} correspondant à votre recherche</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 shadow-sm animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Aucun examen trouvé</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
            <button onClick={() => { setSearch(''); setFilter('Tous'); }} className="btn-primary">
              Effacer tout
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((exam, idx) => {
                const cfg = typeConfig[exam.type] || typeConfig['QCM'];
                const eid = exam._id || exam.id;
                const retakeBlocked = exam.hasRetake && retakeMap[eid] === false;
                return (
                  <div
                    className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col animate-fade-in-up ${retakeBlocked ? 'opacity-60 pointer-events-none' : ''}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                  
                  <div className={`relative h-36 bg-gradient-to-br ${cfg.color} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative text-5xl transform group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="w-16 h-16 text-white/30" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <LevelBadge level={exam.level} />
                    </div>
                    <div className="absolute top-3 right-3">
                      {examTypeBadge(exam)}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5">{exam.subject}</p>
                    <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 line-clamp-2 leading-snug text-base">
                      {exam.title}
                    </h3>
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{exam.duration} min</span>
                        <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" />{exam.totalQuestions} Q</span>
                        {exam.examDate && (
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(exam.examDate).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exam.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">#{tag}</span>
                        ))}
                        {exam.hasRetake && retakeMap[exam._id || exam.id] === true && (
                          <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                            <RotateCcw className="w-3 h-3" /> Rattrapage
                          </span>
                        )}
                        {exam.hasRetake && retakeMap[exam._id || exam.id] === false && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Rattrapage non disponible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-750 border-t border-slate-200 dark:border-slate-700 transition-all duration-300">
                    {retakeBlocked ? (
                      <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Non disponible
                      </span>
                    ) : (
                      <Link to={`/exams/${eid}`}
                        className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        En savoir plus <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((exam, idx) => {
              const cfg = typeConfig[exam.type] || typeConfig['QCM'];
              const eid = exam._id || exam.id;
              const retakeBlocked = exam.hasRetake && retakeMap[eid] === false;
              return retakeBlocked ? (
                <div key={eid}
                  className="group flex items-center gap-6 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 opacity-60 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{exam.subject}</span>
                      {examTypeBadge(exam)}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{exam.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>⏱ {exam.duration} min</span>
                      <span>❓ {exam.totalQuestions} questions</span>
                      {exam.examDate && <span>📅 {new Date(exam.examDate).toLocaleDateString('fr-FR')}</span>}
                      <span className="text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Rattrapage non disponible</span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5"><Lock className="w-4 h-4" /> Non disponible</span>
                </div>
              ) : (
                <Link key={eid} to={`/exams/${eid}`}
                  className="group flex items-center gap-6 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{exam.subject}</span>
                      {examTypeBadge(exam)}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors truncate">{exam.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>⏱ {exam.duration} min</span>
                      <span>❓ {exam.totalQuestions} questions</span>
                      {exam.examDate && <span>📅 {new Date(exam.examDate).toLocaleDateString('fr-FR')}</span>}
                      {exam.hasRetake && retakeMap[exam._id || exam.id] === true && <span className="text-orange-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Rattrapage</span>}
                    </div>
                  </div>
                  <LevelBadge level={exam.level} />
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
