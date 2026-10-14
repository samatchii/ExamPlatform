import React from 'react';

const gradients = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  green: 'from-emerald-500 to-green-500',
  orange: 'from-orange-500 to-red-500',
  indigo: 'from-indigo-500 to-purple-500',
  teal: 'from-teal-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
};

const StatCard = ({ title, value, subtext, positive, negative, icon: Icon, iconBg = 'blue', darkMode }) => {
  const isPositive = positive === true;
  const isNegative = negative === true;
  const grad = gradients[iconBg] || gradients.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group cursor-default ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grad}`} />
      
      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
          <p className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {(subtext || isPositive !== undefined) && (
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-500 dark:text-red-400' : 'text-slate-500'
            }`}>
              {isPositive && <span className="text-emerald-500">↑</span>}
              {isNegative && <span className="text-red-500">↓</span>}
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg shadow-${iconBg}-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0`}>
          {Icon && <Icon size={22} className="text-white" />}
        </div>
      </div>

      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${grad} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
    </div>
  );
};

export default StatCard;
