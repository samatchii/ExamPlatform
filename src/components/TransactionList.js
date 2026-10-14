import React from 'react';

const TransactionList = ({ darkMode, results }) => (
  <div className={`rounded-2xl shadow-sm border p-6 h-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Résultats récents
        </h2>
        <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Dernières tentatives sur la plateforme
        </p>
      </div>
    </div>

    <div className="space-y-1">
      {results && results.length > 0 ? (
        results.map((tx, i) => (
          <div
            key={tx.id}
            className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-200 ${
              darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50'
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-coursera-blue`}>
              {tx.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {tx.name}
              </p>
              <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'} truncate`}>
                {tx.examTitle} • {new Date(tx.date).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <span className={`text-sm font-bold flex-shrink-0 ${tx.passed ? 'text-emerald-500' : 'text-red-500'}`}>
              {tx.score}%
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-gray-400 italic text-sm">
          Aucune tentative enregistrée pour le moment.
        </div>
      )}
    </div>
  </div>
);

export default TransactionList;
