import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Spinner } from '../../components/Common';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student',
    validated: true,
    status: 'Validé'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (user) => {
    setSaving(true);
    try {
      const updatedStatus = !user.validated ? 'Validé' : 'Non validé';
      await api.updateAdminUser(user.id, {
        validated: !user.validated,
        status: updatedStatus
      });
      await loadUsers();
      setActionModal(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling account activation:', error);
      alert("Erreur lors de la modification de l'état du compte");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    setSaving(true);
    try {
      await api.deleteUser(userId);
      await loadUsers();
      setActionModal(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.updateAdminUser(selectedUser.id, editForm);
      await loadUsers();
      setActionModal(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || "Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role?.toUpperCase() || 'STUDENT',
      validated: user.validated ?? false,
      status: user.status || 'Non validé'
    });
    setActionModal('edit');
  };

  const getFilteredUsers = () => {
    let result = users;

    switch (filter) {
      case 'pending':
        result = result.filter(u => !u.validated);
        break;
      case 'students':
        result = result.filter(u => u.role?.toUpperCase() === 'STUDENT');
        break;
      case 'teachers':
        result = result.filter(u => u.role?.toUpperCase() === 'PROFESSOR' || u.role?.toUpperCase() === 'TEACHER');
        break;
      case 'admins':
        result = result.filter(u => u.role?.toUpperCase() === 'ADMIN');
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }

    return result;
  };

  const getStatusBadge = (status, validated) => {
    if (!validated) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Désactivé
        </span>
      );
    }
    switch (status) {
      case 'Validé':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Actif
          </span>
        );
      case 'Non validé':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Désactivé
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Absent
          </span>
        );
      case 'Rattrapage':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Rattrapage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    const r = role?.toUpperCase();
    switch (r) {
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            🎓 Étudiant
          </span>
        );
      case 'PROFESSOR':
      case 'TEACHER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
            👨‍🏫 Professeur
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            🛡️ Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-100">
            {role}
          </span>
        );
    }
  };

  if (loading) return <Spinner />;

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez les permissions, approuvez les comptes de vos collaborateurs et modifiez les profils.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            id="search_users"
            name="search"
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue transition-all text-sm"
          />
          <label htmlFor="search_users" className="absolute left-3.5 top-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Utilisateurs', count: users.length, color: 'text-gray-900 bg-gray-50' },
          { label: 'En attente / Désactivés', count: users.filter(u => !u.validated).length, color: 'text-amber-600 bg-amber-50/50' },
          { label: 'Étudiants', count: users.filter(u => u.role?.toUpperCase() === 'STUDENT').length, color: 'text-blue-600 bg-blue-50/50' },
          { label: 'Professeurs', count: users.filter(u => u.role?.toUpperCase() === 'PROFESSOR' || u.role?.toUpperCase() === 'TEACHER').length, color: 'text-purple-600 bg-purple-50/50' },
          { label: 'Administrateurs', count: users.filter(u => u.role?.toUpperCase() === 'ADMIN').length, color: 'text-rose-600 bg-rose-50/50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'pending', label: 'En attente / Désactivés' },
          { id: 'students', label: 'Étudiants' },
          { id: 'teachers', label: 'Professeurs' },
          { id: 'admins', label: 'Administrateurs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === tab.id
                ? 'bg-coursera-blue text-white shadow-md shadow-coursera-blue/15'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Statut de connexion</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>Aucun utilisateur trouvé.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-coursera-lightBlue text-coursera-blue flex items-center justify-center font-bold text-sm border border-blue-100">
                          {user.avatar || user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status, user.validated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal('toggle-active');
                          }}
                          className={`p-2 rounded-xl border transition-all ${
                            user.validated
                              ? 'border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={user.validated ? 'Désactiver le compte' : 'Activer le compte'}
                        >
                          {user.validated ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                          title="Modifier le compte"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionModal('delete');
                          }}
                          className="p-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                          title="Supprimer le compte"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {actionModal === 'toggle-active' && selectedUser && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {selectedUser.validated ? 'Désactiver le compte' : 'Activer le compte'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir {selectedUser.validated ? 'désactiver' : 'activer'} le compte de <strong>{selectedUser.name}</strong> ({selectedUser.email}) ?
              {selectedUser.validated && " Cet utilisateur ne pourra plus se connecter à la plateforme."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleToggleActivation(selectedUser)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-colors ${
                  selectedUser.validated
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                }`}
                disabled={saving}
              >
                {saving ? 'Traitement...' : selectedUser.validated ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-rose-600 mb-2">Supprimer le compte</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{selectedUser.name}</strong> ({selectedUser.email}) ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedUser.id)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 rounded-xl text-sm font-bold transition-colors"
                disabled={saving}
              >
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal === 'edit' && selectedUser && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Modifier le compte</h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit_name" className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom complet</label>
                <input
                  id="edit_name"
                  name="name"
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue text-sm"
                />
              </div>

              <div>
                <label htmlFor="edit_email" className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                <input
                  id="edit_email"
                  name="email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit_role" className="block text-xs font-bold text-gray-500 uppercase mb-2">Rôle</label>
                  <select
                    id="edit_role"
                    name="role"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue text-sm"
                  >
                    <option value="STUDENT">🎓 Étudiant</option>
                    <option value="PROFESSOR">👨‍🏫 Professeur</option>
                    <option value="ADMIN">🛡️ Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit_status" className="block text-xs font-bold text-gray-500 uppercase mb-2">Statut du compte</label>
                  <select
                    id="edit_status"
                    name="status"
                    value={editForm.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setEditForm({
                        ...editForm,
                        status: newStatus,
                        validated: newStatus === 'Validé' || newStatus === 'Absent' || newStatus === 'Rattrapage'
                      });
                    }}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue text-sm"
                  >
                    <option value="Validé">Actif / Validé</option>
                    <option value="Non validé">Désactivé / Non validé</option>
                    <option value="Absent">Absent</option>
                    <option value="Rattrapage">Rattrapage</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-coursera-blue hover:bg-coursera-darkBlue text-white shadow-md shadow-coursera-blue/15 rounded-xl text-sm font-bold transition-colors"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
