import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap, Award, TrendingUp } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      const isAdminOrProf = ['admin', 'teacher', 'ADMIN', 'PROFESSOR'].includes(user.role);
      navigate(isAdminOrProf ? '/admin' : '/dashboard');
    } catch (err) { setError(err.message); }
  };
  const demos = [
    { label: 'Étudiant', email: 'alice@univ.fr', pass: '123456', color: 'from-blue-500 to-cyan-500' },
    { label: 'Professeur', email: 'prof@univ.fr', pass: 'prof123', color: 'from-purple-500 to-pink-500' },
    { label: 'Admin', email: 'admin@univ.fr', pass: 'admin123', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>
        <div className="relative z-10 max-w-lg text-center px-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-10 border border-white/10">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Plateforme d'examens certifiante
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Apprenez sans{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">limites</span>
          </h1>
          <p className="text-xl text-blue-200/80 leading-relaxed mb-12">
            Rejoignez des milliers d'étudiants et validez vos compétences avec nos examens certifiants.
          </p>
          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { icon: GraduationCap, label: 'Certifications', desc: 'Reconnues officiellement' },
              { icon: Award, label: 'Examens', desc: 'QCM, Contrôle, Final' },
              { icon: TrendingUp, label: 'Suivi', desc: 'Progression en temps réel' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                <item.icon className="w-6 h-6 text-blue-300 mb-2" />
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-blue-200/60 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bienvenue</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Connectez-vous pour continuer votre apprentissage</p>
          </div>
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-sm animate-fade-in">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input id="email" type="email" required
                  className="input pl-11" placeholder="nom@exemple.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe</label>
                <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline opacity-70 hover:opacity-100 transition-opacity">Mot de passe oublié ?</button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} required
                  className="input pl-11 pr-11" placeholder="Votre mot de passe"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Connexion...</>
              ) : 'Se connecter'}
            </button>
          </form>
          <div className="mt-8 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Accès rapide Démo
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demos.map((demo, i) => (
                <button key={i} type="button" onClick={() => setForm({ email: demo.email, password: demo.pass })}
                  className="group relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left">
                  <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{demo.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono truncate">{demo.email}</p>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Nouveau sur ExamPlatform ?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Inscrivez-vous gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
