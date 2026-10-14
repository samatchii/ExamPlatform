import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, Search, Menu, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const role = user?.role?.toUpperCase();
  const links = [
    { to: '/dashboard', label: 'Tableau de bord' }
  ];

  if (role === 'STUDENT') {
    links.push({ to: '/exams', label: 'Examens' });
    links.push({ to: '/results', label: 'Mes résultats' });
  }

  if (role === 'ADMIN' || role === 'PROFESSOR' || role === 'TEACHER') {
    links.push({ to: '/admin', label: 'Administration' });
    links.push({ to: '/analytics', label: 'Analytics' });
  }

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-2xl tracking-tight hidden md:block group-hover:text-primary-600 transition-colors">
                Exam<span className="text-primary-600">Platform</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <input 
                type="text" 
                placeholder="Rechercher des examens..." 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary-500/50 outline-none text-sm transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400" 
              />
              <div className="absolute left-4 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              {links.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  /* Lien de navigation avec style conditionnel selon l'état actif */
                  <Link 
                    key={link.to} /* Clé unique pour React */
                    to={link.to} /* Chemin de destination */
                    /* Classe CSS dynamique : couleur différente si le lien est actif */
                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {link.label}
                    {isActive && (
                      /* motion.div avec layoutId pour que l'animation de l'indicateur glisse entre les liens */
                      <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1">Bienvenue</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name || 'Utilisateur'}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-sm border-2 border-primary-200 dark:border-primary-800">
                  {user?.avatar || user?.name?.charAt(0) || 'U'}
                </div>
                <button onClick={handleLogout} className="p-2 ml-1 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Déconnexion">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          /* motion.div avec animation d'ouverture/fermeture (opacité et hauteur) */
          <motion.div 
            /* État initial : invisible et hauteur nulle */
            initial={{ opacity: 0, height: 0 }}
            /* État d'animation : visible avec hauteur automatique */
            animate={{ opacity: 1, height: 'auto' }}
            /* État de sortie : retour à invisible et hauteur nulle */
            exit={{ opacity: 0, height: 0 }}
            /* Classes CSS : visible uniquement sur les écrans où lg est masqué, avec bordure et fond */
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => (
                /* Chaque lien ferme le menu mobile au clic (onClick -> setMobileMenuOpen(false)) */
                <Link 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setMobileMenuOpen(false)}
                  /* Style conditionnel selon que le lien est actif ou non */
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${location.pathname.startsWith(link.to) ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-danger w-full text-left font-medium">
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
