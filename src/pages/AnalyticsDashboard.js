import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, FileText, TrendingUp,
  Sun, Moon, Bell, RefreshCw, ArrowLeft,
  BarChart3, Activity, Award, Calendar,
  TrendingDown, ChevronRight, Sparkles, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import TransactionChart from '../components/TransactionChart';
import TransactionList from '../components/TransactionList';
import { Spinner } from '../components/Common';

const AnalyticsDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadAnalytics(); }, []);
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await api.getAnalytics();
      setData(stats);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des statistiques.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadAnalytics} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
            <RefreshCw className="w-4 h-4 inline mr-2" />Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const safe = (v, d = 0) => v != null ? v : d;
  const uc = safe(data.usersChange);
  const ec = safe(data.examsChange);
  const rc = safe(data.resultsChange);
  const pc = safe(data.passRateChange);

  const stats = [
    {
      title: 'Total Utilisateurs',
      value: safe(data.totalUsers).toString(),
      subtext: `${uc >= 0 ? '+' : ''}${uc}% depuis hier`,
      positive: uc > 0, negative: uc < 0,
      icon: Users, iconBg: 'blue',
    },
    {
      title: 'Examens Créés',
      value: safe(data.totalExams).toString(),
      subtext: `${ec >= 0 ? '+' : ''}${ec} cette semaine`,
      positive: ec > 0, negative: ec < 0,
      icon: FileText, iconBg: 'purple',
    },
    {
      title: 'Tentatives d\'examens',
      value: safe(data.totalResults).toString(),
      subtext: `${rc >= 0 ? '+' : ''}${rc}% ce mois`,
      positive: rc > 0, negative: rc < 0,
      icon: Activity, iconBg: 'emerald',
    },
    {
      title: 'Taux de réussite',
      value: `${safe(data.passRate)}%`,
      subtext: `${pc >= 0 ? '+' : ''}${pc}% par rapport au mois dernier`,
      positive: pc > 0, negative: pc < 0,
      icon: Award, iconBg: 'amber',
    },
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:bg-white/20 transition-all">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Analytics</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/70 hover:bg-white/20 transition-all">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
              </button>
              <button onClick={() => setDarkMode(d => !d)} className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/70 hover:bg-white/20 transition-all">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={loadAnalytics} className="ml-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                <RefreshCw size={14} /> Rafraîchir
              </button>
            </div>
          </div>
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/70 text-sm font-medium mb-4 border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Tableau de bord administratif
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Vue d'ensemble du système
            </h1>
            <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
              Statistiques en temps réel basées sur les données du projet
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <StatCard {...stat} darkMode={darkMode} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-[400px] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className={`p-6 rounded-2xl border transition-all duration-300 h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Activité des examens
                </h3>
              </div>
              <TransactionChart darkMode={darkMode} data={data.activity} />
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className={`p-6 rounded-2xl border transition-all duration-300 h-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`font-bold text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Activity className="w-5 h-5 text-emerald-500" />
                Résultats récents
                </h3>
                <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>5 derniers</span>
              </div>
              <TransactionList darkMode={darkMode} results={data.recentResults} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
