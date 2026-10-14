import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/Common';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import ExamDetail from './pages/ExamDetail';
import TakeExam from './pages/TakeExam';
import Results from './pages/Results';
import StudentResults from './pages/StudentResults';
import AdminPanel from './pages/admin/AdminPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import StudentDashboard from './pages/StudentDashboard';
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    { /* Inclusion de la barre de navigation en haut de toutes les pages */ }
    <Navbar />
    { /* Zone de contenu principal qui s'étend pour remplir l'espace restant (flex-grow) */ }
    <main className="flex-grow">{children}</main>
    { /* Inclusion du pied de page en bas */ }
    <Footer />
  </div>
);
const DashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  if (role === 'STUDENT') {
    return <StudentDashboard />;
  }
  return <Dashboard />;
};
const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
{ /* Route de connexion : si l'utilisateur est connecté, redirection vers /dashboard, sinon affichage du composant Login */ }
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      { /* Route d'inscription : même logique que pour la connexion */ }
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
{ /* Tableau de bord : route privée avec le layout complet */ }
      <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardRouter /></Layout></PrivateRoute>} />
      { /* Liste des examens : route privée avec layout */ }
      <Route path="/exams" element={<PrivateRoute><Layout><ExamList /></Layout></PrivateRoute>} />
      { /* Détail d'un examen : route privée avec layout */ }
      <Route path="/exams/:id" element={<PrivateRoute><Layout><ExamDetail /></Layout></PrivateRoute>} />
      { /* Page pour passer un examen : route privée SANS layout (pleine page) */ }
      <Route path="/exams/:id/take" element={<PrivateRoute><TakeExam /></PrivateRoute>} />
      { /* Liste des résultats de l'étudiant : route privée avec layout */ }
      <Route path="/results" element={<PrivateRoute><Layout><StudentResults /></Layout></PrivateRoute>} />
      { /* Détail d'un résultat : route privée avec layout */ }
      <Route path="/results/:id" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
{ /* Panneau d'administration : route privée avec vérification des rôles autorisés (admin, teacher, ADMIN, PROFESSOR) */ }
      <Route path="/admin" element={<PrivateRoute roles={['admin', 'teacher', 'ADMIN', 'PROFESSOR']}><Layout><AdminPanel /></Layout></PrivateRoute>} />
      { /* Tableau de bord analytique : route privée */ }
      <Route path="/analytics" element={<PrivateRoute><AnalyticsDashboard /></PrivateRoute>} />
{ /* Route catch-all '*' : redirige vers /dashboard si connecté, sinon vers /login */ }
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};
const App = () => (
  <BrowserRouter>
    { /* AuthProvider rend le contexte d'authentification disponible pour tous les composants enfants */ }
    <AuthProvider>
      { /* Toaster est le conteneur de notifications toast positionné en haut à droite */ }
      { /* toastOptions : style pour le mode sombre et durée d'affichage de 4 secondes */ }
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', duration: 4000 }} />
      { /* AppRoutes contient l'arbre des routes de l'application */ }
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);
export default App;
