import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ScoreBadge, Spinner } from '../components/Common';
const StatCard = ({ label, value, icon, color, description }) => (
  <div className={`card border-l-4 ${color} hover:shadow-lg transition-all`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${color.replace('border-l-', 'bg-').replace('-500', '-50')}`}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadDashboardData();
  }, [user?.id, user?.role]);
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const role = user?.role?.toUpperCase();
      if (role === 'PROFESSOR' || role === 'ADMIN' || role === 'TEACHER') {
        const loadedExams = await api.getExams().catch(() => []);
        const loadedResults = await api.getAllResults().catch(() => []);
        const loadedUsers = await api.getAdminUsers().catch(() => []);
        setExams(Array.isArray(loadedExams) ? loadedExams : []);
        setAllResults(Array.isArray(loadedResults) ? loadedResults : []);
        setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
      } else {
        const loadedResults = await api.getUserResults(user.id).catch(() => []);
        const loadedExams = await api.getExams().catch(() => []);
        setResults(Array.isArray(loadedResults) ? loadedResults : []);
        setExams(Array.isArray(loadedExams) ? loadedExams : []);
      }
    } catch (err) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!user) return null;

  if (error) {
    console.log('Dashboard error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary w-full">Réessayer</button>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard for role:', user.role);

  const role = user?.role?.toUpperCase();
  if (role === 'PROFESSOR' || role === 'ADMIN' || role === 'TEACHER') {
    const myExams = exams || [];
    const students = (users || []).filter(u => u && u.role?.toUpperCase() === 'STUDENT');
    const totalScore = (allResults || []).reduce((s, r) => s + (r && r.score ? Number(r.score) : 0), 0);
    const avgScore = allResults?.length ? Math.round(totalScore / allResults.length) : 0;
    const passCount = (allResults || []).filter(r => r && r.passed).length;
    const passRate = allResults?.length ? Math.round((passCount / allResults.length) * 100) : 0;

    console.log('Teacher stats:', { myExams: myExams.length, students: students.length, avgScore, passRate });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 pb-24">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              👋 Bonjour, {(user.name || 'User').split(' ')[0]} !
            </h1>
            <p className="text-blue-200 text-lg">Gérez vos examens et suivez la progression de vos étudiants</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-blue-900/5 border border-blue-100/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Examens créés</p>
                <span className="text-xl">📚</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{myExams.length}</p>
              <p className="text-xs text-gray-400 mt-1">Total des examens</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-blue-900/5 border border-green-100/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Étudiants actifs</p>
                <span className="text-xl">👥</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{students.length}</p>
              <p className="text-xs text-gray-400 mt-1">Inscrits</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-blue-900/5 border border-yellow-100/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Score moyen</p>
                <span className="text-xl">📊</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{avgScore}%</p>
              <p className="text-xs text-gray-400 mt-1">Performance globale</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-blue-900/5 border border-purple-100/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Taux de réussite</p>
                <span className="text-xl">✅</span>
              </div>
              <p className="text-3xl font-black text-gray-900">{passRate}%</p>
              <p className="text-xs text-gray-400 mt-1">Examens validés</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                      <span className="text-lg">📝</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Mes examens</h2>
                  </div>
                  <Link to="/admin" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all">+ Créer</Link>
                </div>
                {myExams.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <span className="text-5xl block mb-4">📚</span>
                    <p className="text-gray-400 font-medium">Aucun examen créé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myExams.slice(0, 4).map((e, idx) => (
                      <div key={e._id || e.id || idx} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50/50">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                            e.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {e.approvalStatus === 'APPROVED' ? '✓ Approuvé' : '⏳ En attente'}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">⏱ {e.duration} min</span>
                        </div>
                        <p className="font-bold text-gray-900">{e.title || 'Sans titre'}</p>
                        <p className="text-xs text-gray-400 mt-1">{e.subject || ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-1">⚡ Actions rapides</h3>
                <p className="text-blue-200 text-sm mb-5">Gérez votre plateforme d'examens</p>
                <div className="space-y-2">
                  <Link to="/admin" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                    <span className="text-lg">➕</span>
                    <span className="font-bold text-sm">Créer un examen</span>
                  </Link>
                  <Link to="/admin" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                    <span className="text-lg">📊</span>
                    <span className="font-bold text-sm">Voir tous les résultats</span>
                  </Link>
                  <Link to="/admin" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                    <span className="text-lg">📝</span>
                    <span className="font-bold text-sm">Corrections en attente</span>
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">🎯 Performance</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500 font-medium">Taux de réussite</span>
                      <span className="font-bold text-emerald-600">{passRate}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(passRate, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500 font-medium">Score moyen</span>
                      <span className="font-bold text-blue-600">{avgScore}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(avgScore, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const safeResults = Array.isArray(results) ? results : [];
  const safeExams = Array.isArray(exams) ? exams : [];
  const avgScore = safeResults.length ? Math.round(safeResults.reduce((s, r) => s + (r.score || 0), 0) / safeResults.length) : 0;
  const passed = safeResults.filter(r => r && r.passed).length;
  const completedIds = new Set(safeResults.map(r => r.examId).filter(Boolean));
  const available = safeExams.filter(e => e && !completedIds.has(e._id || e.id));

  console.log('Student stats:', { results: safeResults.length, exams: safeExams.length, avgScore, passed });

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-coursera-blue py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Ravi de vous revoir, {(user.name || 'User').split(' ')[0]} !
          </h1>
          <p className="text-blue-100 text-lg">Continuez votre apprentissage et validez vos compétences.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 -mt-20">
          <StatCard label="Examens passés" value={safeResults.length} icon="📝" color="border-l-blue-500" description="Total des tentatives" />
          <StatCard label="Réussis" value={passed} icon="✅" color="border-l-green-500" description="Examens validés" />
          <StatCard label="Score moyen" value={`${avgScore}%`} icon="📊" color="border-l-yellow-500" description="Performance globale" />
          <StatCard label="Disponibles" value={available.length} icon="🎯" color="border-l-purple-500" description="Nouveaux défis" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Résultats récents</h2>
                <Link to="/results" className="text-coursera-blue font-semibold hover:underline text-sm">Voir tout</Link>
              </div>
              {safeResults.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">🎓</div>
                  <p className="text-gray-500">Vous n'avez pas encore passé d'examen.</p>
                  <Link to="/exams" className="btn-primary inline-block mt-4">Commencer maintenant</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeResults.slice(-3).reverse().map((r, idx) => (
                    <div key={r._id || r.id || idx} className="card flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📄</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{r.exam?.title || 'Examen'}</h3>
                          <p className="text-sm text-gray-500">{r.date ? new Date(r.date).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <ScoreBadge score={r.score || 0} passing={r.exam?.passingScore || 60} />
                        <p className="text-xs text-gray-400 mt-1">{r.score || 0}% obtenu</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recommandé pour vous</h2>
                <Link to="/exams" className="text-coursera-blue font-semibold hover:underline text-sm">Tout parcourir</Link>
              </div>
              {available.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-gray-500">Aucun examen disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {available.slice(0, 4).map((e, idx) => (
                    <Link key={e._id || e.id || idx} to={`/exams/${e._id || e.id}`} className="card hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-coursera-blue bg-coursera-lightBlue px-2 py-1 rounded mb-3 inline-block">
                          {e.level || 'Niveau'}
                        </span>
                        <h3 className="font-bold text-gray-900 mb-2">{e.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{e.description || 'Développez vos compétences.'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">⏱ {e.duration || 60} min</span>
                        <span className="text-coursera-blue text-sm font-bold">En savoir plus →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
          <div className="space-y-6">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
