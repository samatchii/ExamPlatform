import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
  { role: 'student', icon: '🎓', label: 'Étudiant', desc: 'Passez des examens et obtenez des certificats' },
  { role: 'teacher', icon: '👨🏫', label: 'Professeur', desc: 'Créez des examens et suivez vos étudiants' },
  { role: 'admin', icon: '🛡️', label: 'Administrateur', desc: 'Gestion globale de la plateforme' },
];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas');
    if (form.password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères');
    try {
      const res = await register(form.name, form.email, form.password, form.role);
      if (res && res.pending) {
        setSuccessMessage(res.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) { setError(err.message); }
  };
  if (successMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Inscription Réussie !</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {successMessage}
          </p>
          <Link to="/login" className="btn-primary inline-block w-full py-4 text-lg text-center font-bold">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  const selectedRole = roles.find(r => r.role === form.role);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-coursera-blue items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">Commencez votre voyage</h1>
          <p className="text-xl text-blue-100 leading-relaxed mb-8">
            Créez un compte gratuitement et rejoignez notre communauté d'apprentissage d'élite.
          </p>
          <div className="space-y-6">
            {roles.map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
                <div>
                  <p className="font-bold">{label}</p>
                  <p className="text-sm text-blue-200">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:text-left">
            <div className="w-12 h-12 bg-coursera-blue rounded flex items-center justify-center mb-6 md:mx-0 mx-auto">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="text-gray-500 mt-2 text-sm">Choisissez votre rôle pour commencer</p>
          </div>
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {roles.map(({ role, icon, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    form.role === role
                      ? 'border-coursera-blue bg-blue-50 text-coursera-blue shadow-md scale-[1.02]'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                </button>
              ))}
            </div>
            {form.role === 'admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                🛡️ <span className="font-bold">Compte Administrateur</span> — Accès complet à la gestion de la plateforme : utilisateurs, examens, salles, planification et statistiques.
              </div>
            )}
            <div>
              <label htmlFor="register_name" className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
              <input 
                id="register_name"
                name="name"
                type="text" 
                required 
                className="input" 
                placeholder="Jean Dupont"
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div>
              <label htmlFor="register_email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input 
                id="register_email"
                name="email"
                type="email" 
                required 
                className="input" 
                placeholder="nom@exemple.com"
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="register_password" className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
                <input 
                  id="register_password"
                  name="password"
                  type="password" 
                  required 
                  className="input" 
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                />
              </div>
              <div>
                <label htmlFor="register_confirm" className="block text-sm font-bold text-gray-700 mb-2">Confirmer</label>
                <input 
                  id="register_confirm"
                  name="confirm"
                  type="password" 
                  required 
                  className="input" 
                  placeholder="••••••••"
                  value={form.confirm} 
                  onChange={e => setForm({ ...form, confirm: e.target.value })} 
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              En vous inscrivant en tant que <span className="font-bold text-coursera-blue">{selectedRole?.label}</span>, vous acceptez nos <span className="text-coursera-blue font-bold cursor-pointer hover:underline">Conditions d'utilisation</span>.
            </p>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
              {loading ? 'Création du compte...' : "S'inscrire gratuitement"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ? <Link to="/login" className="text-coursera-blue font-bold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
