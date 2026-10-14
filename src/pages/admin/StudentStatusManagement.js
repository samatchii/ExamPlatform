import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Spinner } from '../../components/Common';

const StudentStatusManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const users = await api.getAdminUsers();
      const studentUsers = users.filter(u => u.role?.toUpperCase() === 'STUDENT');
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = async (studentId, newStatus) => {
    setUpdating(studentId);
    try {
      await api.updateUserStatus(studentId, newStatus);
      await loadStudents();
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Validé':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✅ Validé
          </span>
        );
      case 'Non validé':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ⏳ Non validé
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            ❌ Absent
          </span>
        );
      case 'Rattrapage':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            🔄 Rattrapage
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion du statut des étudiants</h2>
            <p className="text-gray-500 text-sm mt-1">Déclarez le statut de validation des étudiants</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coursera-blue/20 focus:border-coursera-blue transition-all text-sm"
            />
            <div className="absolute left-3.5 top-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Étudiant</th>
                <th className="px-6 py-4">Statut actuel</th>
                <th className="px-6 py-4">Actions rapides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">👨‍🎓</p>
                    <p>Aucun étudiant trouvé.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-coursera-lightBlue text-coursera-blue flex items-center justify-center font-bold text-sm border border-blue-100">
                          {student.avatar || student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {['Validé', 'Non validé', 'Absent', 'Rattrapage'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateStudentStatus(student.id, status)}
                            disabled={updating === student.id || student.status === status}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              student.status === status
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : status === 'Validé'
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : status === 'Absent'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : status === 'Rattrapage'
                                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {updating === student.id ? '...' : status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentStatusManagement;
