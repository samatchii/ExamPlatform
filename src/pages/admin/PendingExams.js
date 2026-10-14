import React, { useState } from 'react';
import { api } from '../../services/api';
import { LevelBadge } from '../../components/Common';

const PendingExams = ({ exams, onApprove, onReject }) => {
  const [processing, setProcessing] = useState(null);

  const handleApprove = async (examId) => {
    setProcessing(examId);
    try {
      await api.approveExam(examId);
      onApprove();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (examId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cet examen ?')) return;
    setProcessing(examId);
    try {
      await api.rejectExam(examId);
      onReject();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-amber-50/50">
        <h2 className="text-xl font-bold text-gray-900">Examens en attente d'approbation</h2>
        <p className="text-sm text-gray-600 mt-1">Les professeurs ont soumis ces examens pour validation</p>
      </div>
      
      {exams.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p>Aucun examen en attente</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {exams.map(exam => (
            <div key={exam._id || exam.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                    <LevelBadge level={exam.level} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      📚 {exam.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱ {exam.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      ❓ {exam.totalQuestions} questions
                    </span>
                    {exam.teacherName && (
                      <span className="flex items-center gap-1">
                        👨🏫 {exam.teacherName}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(exam._id || exam.id)}
                    disabled={processing === (exam._id || exam.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(exam._id || exam.id)}
                    disabled={processing === (exam._id || exam.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingExams;
