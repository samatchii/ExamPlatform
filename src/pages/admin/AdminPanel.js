import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { LevelBadge } from '../../components/Common';
import { useAuth } from '../../context/AuthContext';
import AllResults from './AllResults';
import PendingCorrections from './PendingCorrections';
import UserManagement from './UserManagement';
import PendingExams from './PendingExams';
import { Plus, Edit3, Trash2, Save, X, BookOpen, Search, Sparkles, Clock, FileText, HelpCircle, Layers } from 'lucide-react';

const typeConfig = {
  'QCM': { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  'Contrôle': { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  'Examen final': { color: 'from-red-500 to-rose-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

const emptyExam = { title: '', subject: '', type: 'QCM', duration: 60, level: 'Débutant', passingScore: 50, description: '', examDate: '', tags: '', questions: [], openQuestions: [] };
const emptyQuestion = { text: '', options: ['', '', '', ''], correct: 0 };
const emptyOpenQuestion = { text: '' };

const TypeBadge = ({ type }) => {
  const cfg = typeConfig[type] || typeConfig['QCM'];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>{type || 'QCM'}</span>;
};

const AdminPanel = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');
  const [form, setForm] = useState(emptyExam);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingExams, setPendingExams] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const role = user?.role?.toUpperCase();

  const load = async () => {
    try {
      const e = await api.getExams();
      setExams(e || []);
      if (role === 'ADMIN') {
        const pe = await api.getPendingExams();
        setPendingExams(pe || []);
      }
      const pr = await api.getPendingResults();
      setPendingResults(pr || []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [user]);

  const openCreate = () => {
    setForm(emptyExam);
    setEditId(null);
    setModal('edit');
  };

  const openEdit = async (exam) => {
    const id = exam._id || exam.id;
    if (!id) return;
    setLoading(true);
    try {
      const full = await api.getExam(id);
      setForm({ ...full, tags: full.tags?.join(', ') || '', examDate: full.examDate || '', questions: full.questions || [], openQuestions: full.openQuestions || [] });
      setEditId(full._id || full.id);
      setModal('edit');
    } catch (err) {
      alert("Erreur lors de la récupération des détails");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet examen ?')) return;
    await api.deleteExam(id);
    load();
  };

  const addQuestion = () => setForm(f => ({ ...f, questions: [...(f.questions || []), { ...emptyQuestion, options: ['', '', '', ''] }] }));
  const addOpenQuestion = () => setForm(f => ({ ...f, openQuestions: [...(f.openQuestions || []), { ...emptyOpenQuestion }] }));
  const removeQuestion = (i) => setForm(f => ({ ...f, questions: (f.questions || []).filter((_, idx) => idx !== i) }));
  const removeOpenQuestion = (i) => setForm(f => ({ ...f, openQuestions: (f.openQuestions || []).filter((_, idx) => idx !== i) }));
  const updateQuestion = (i, field, val) => setForm(f => {
    const qs = [...(f.questions || [])];
    qs[i] = { ...qs[i], [field]: val };
    return { ...f, questions: qs };
  });
  const updateOpenQuestion = (i, val) => setForm(f => {
    const qs = [...(f.openQuestions || [])];
    qs[i] = { ...qs[i], text: val };
    return { ...f, openQuestions: qs };
  });
  const updateOption = (qi, oi, val) => setForm(f => {
    const qs = [...(f.questions || [])];
    const opts = [...(qs[qi]?.options || [])];
    opts[oi] = val;
    qs[qi] = { ...qs[qi], options: opts };
    return { ...f, questions: qs };
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      totalQuestions: form.type === 'QCM' ? form.questions.length : form.openQuestions.length,
      duration: parseInt(form.duration),
      passingScore: parseInt(form.passingScore)
    };
    try {
      if (editId) {
        await api.updateExam(editId, data);
        alert('Examen mis à jour!');
      } else {
        await api.createExam(data);
        alert('Examen créé! Validation en attente.');
      }
      setModal(null);
      load();
    } catch (err) {
      alert('Erreur: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const filteredExams = exams.filter(e =>
    !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !modal) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 animate-pulse shadow-xl" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'exams', label: 'Examens', icon: BookOpen, show: true },
    { id: 'pending', label: `En attente`, badge: pendingExams.length, icon: Clock, show: role === 'ADMIN' && pendingExams.length > 0 },
    { id: 'corrections', label: 'Corrections', badge: pendingResults.length, icon: FileText, show: role === 'ADMIN' || role === 'PROFESSOR' || role === 'TEACHER' },
    { id: 'results', label: 'Résultats', icon: FileText, show: true },
    { id: 'users', label: 'Utilisateurs', icon: Layers, show: role === 'ADMIN' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-3 border border-white/10">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Panneau d'administration
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Gestion des examens</h1>
              <p className="text-blue-200/80 mt-1">Gérez vos examens et suivez les performances</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
              <Plus className="w-5 h-5" /> Créer un examen
            </button>
          </div>

          <div className="flex gap-2 mt-8 overflow-x-auto pb-1 animate-fade-in-up">
            {tabs.map(tab => tab.show && (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-lg shadow-black/10'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-white/20 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-12 relative z-10">
        {activeTab === 'exams' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-750">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Catalogue des examens
              </h2>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input type="text" placeholder="Rechercher..." className="input pl-10 py-2 text-sm w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-slate-800/30 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">Titre & Matière</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Durée</th>
                    <th className="px-5 py-4">Niveau</th>
                    <th className="px-5 py-4">Questions</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredExams.map((exam, idx) => (
                    <tr key={exam._id || exam.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors duration-150 animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{exam.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{exam.subject}</p>
                      </td>
                      <td className="px-5 py-4"><TypeBadge type={exam.type} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{exam.examDate ? new Date(exam.examDate).toLocaleDateString('fr-FR') : <span className="text-slate-400">-</span>}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{exam.duration} min</td>
                      <td className="px-5 py-4"><LevelBadge level={exam.level} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{exam.totalQuestions || 0}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(exam)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Modifier">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(exam._id || exam.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-12 text-slate-400">Aucun examen trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && role === 'ADMIN' && <PendingExams exams={pendingExams} onApprove={load} onReject={load} />}
        {activeTab === 'corrections' && <PendingCorrections />}
        {activeTab === 'results' && <AllResults />}
        {activeTab === 'users' && role === 'ADMIN' && <UserManagement />}
      </div>

      {modal === 'edit' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 px-8 py-6">
              <div className="absolute inset-0">
                <div className="absolute top-5 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                    {editId ? <Edit3 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">{editId ? 'Modifier' : 'Créer'} l'examen</h2>
                    <p className="text-blue-200/70 text-sm mt-0.5">{editId ? 'Modifiez les détails de l\'examen' : 'Créez un nouvel examen personnalisé'}</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-2xl p-6 border border-blue-200 dark:border-slate-600">
                    <h3 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Informations générales
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Titre</label>
                        <input required className="input" placeholder="Titre de l'examen" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Matière / Module</label>
                        <input required className="input" placeholder="Matière" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Type d'examen</label>
                        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                          <option value="QCM">📋 QCM</option>
                          <option value="Contrôle">📝 Contrôle</option>
                          <option value="Examen final">🎯 Examen final</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {form.type === 'Contrôle' ? 'Les contrôles n\'ont pas de rattrapage' :
                           form.type === 'Examen final' ? 'Les examens finaux peuvent avoir un rattrapage' :
                           'Questionnaire à choix multiples'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Date de l'examen</label>
                        <input type="datetime-local" className="input" value={form.examDate ? form.examDate.substring(0, 16) : ''} onChange={e => setForm({ ...form, examDate: e.target.value ? e.target.value + ':00' : '' })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Durée (min)</label>
                          <input type="number" required className="input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Seuil (0-100)</label>
                          <input type="number" required className="input" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Niveau</label>
                        <select className="input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                          <option>Débutant</option>
                          <option>Intermédiaire</option>
                          <option>Avancé</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea className="input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tags</label>
                        <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tag1, Tag2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-purple-500" /> Questions ({form.type === 'QCM' ? (form.questions || []).length : (form.openQuestions || []).length})
                    </h3>
                    <button type="button" onClick={form.type === 'QCM' ? addQuestion : addOpenQuestion} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>

                  {form.type === 'QCM' ? (
                  <div className="space-y-4">
                    {(form.questions || []).length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-slate-400 dark:text-slate-500">
                        <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Aucune question QCM</p>
                        <p className="text-sm mt-1">Cliquez sur "Ajouter" pour créer votre première question à choix multiples</p>
                      </div>
                    ) : (
                      (form.questions || []).map((q, qi) => (
                        <div key={qi} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/30 dark:to-slate-700/10 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">{qi + 1}</span>
                                Question {qi + 1}
                              </label>
                              <input className="input" placeholder="Question" value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeQuestion(qi)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            {q.options?.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/30 transition-all">
                                <input type="radio" name={`q_${qi}`} checked={q.correct === oi} onChange={() => updateQuestion(qi, 'correct', oi)}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{String.fromCharCode(65 + oi)}.</span>
                                <input className="input flex-1 py-2" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  ) : (
                  <div className="space-y-4">
                    {(form.openQuestions || []).length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-slate-400 dark:text-slate-500">
                        <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Aucune question</p>
                        <p className="text-sm mt-1">Cliquez sur "Ajouter" pour créer votre première question à réponse libre</p>
                      </div>
                    ) : (
                      (form.openQuestions || []).map((q, qi) => (
                        <div key={qi} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/30 dark:to-slate-700/10 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">{qi + 1}</span>
                                Question {qi + 1} (réponse libre)
                              </label>
                              <textarea className="input" rows="2" placeholder="Saisissez votre question..." value={q.text} onChange={e => updateOpenQuestion(qi, e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeOpenQuestion(qi)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  )}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-750 flex justify-end gap-4">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary px-8 flex items-center gap-2">
                <X className="w-4 h-4" /> Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-10 flex items-center gap-2">
                {saving ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Enregistrement...</>
                ) : (
                  <><Save className="w-4 h-4" /> Enregistrer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
