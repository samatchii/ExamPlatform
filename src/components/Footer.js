import React from 'react';
import { BookOpen, Users, Mail, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
                Exam<span className="text-primary-600">Platform</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Plateforme moderne de gestion d'examens et d'évaluation en ligne. Simplifiez vos évaluations avec des outils puissants et intuitifs.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Liens Utiles</h3>
            <ul className="space-y-3">
              <li><Link to="/dashboard" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Tableau de bord</Link></li>
              <li><Link to="/exams" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Catalogue d'examens</Link></li>
              <li><Link to="/analytics" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Statistiques</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Légal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Confidentialité</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Conditions d'utilisation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors text-sm">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            © {new Date().getFullYear()} ExamPlatform. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Mail className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Users className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><LinkIcon className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
