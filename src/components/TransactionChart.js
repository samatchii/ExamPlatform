import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DATASET = {
  day: [
    { label: '06h', amount: 8200 },
    { label: '08h', amount: 15400 },
    { label: '10h', amount: 22100 },
    { label: '12h', amount: 38700 },
    { label: '14h', amount: 31500 },
    { label: '16h', amount: 44200 },
    { label: '18h', amount: 52800 },
    { label: '20h', amount: 39600 },
    { label: '22h', amount: 18300 },
  ],
  week: [
    { label: 'Mon', amount: 42000 },
    { label: 'Tue', amount: 67500 },
    { label: 'Wed', amount: 53200 },
    { label: 'Thu', amount: 89100 },
    { label: 'Fri', amount: 112400 },
    { label: 'Sat', amount: 78600 },
    { label: 'Sun', amount: 34900 },
  ],
  month: [
    { label: 'Jan', amount: 45000 },
    { label: 'Feb', amount: 62000 },
    { label: 'Mar', amount: 58000 },
    { label: 'Apr', amount: 75000 },
    { label: 'May', amount: 88000 },
    { label: 'Jun', amount: 95000 },
    { label: 'Jul', amount: 110000 },
    { label: 'Aug', amount: 102000 },
    { label: 'Sep', amount: 125000 },
    { label: 'Oct', amount: 148000 },
    { label: 'Nov', amount: 162000 },
    { label: 'Dec', amount: 180000 },
  ],
};

const PERIODS = [
  { key: 'day',   label: 'Day' },
  { key: 'week',  label: 'Week' },
  { key: 'month', label: 'Month' },
];

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl shadow-xl text-sm border ${
      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-100 text-gray-900'
    }`}>
      <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className="font-bold">R {payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const TransactionChart = ({ darkMode, data: initialData }) => {
  const [period, setPeriod]       = useState('week');
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'

  const data = (initialData && initialData[period]) ? initialData[period] : DATASET[period];

  const { total, avg, trend } = useMemo(() => {
    const amounts = data.map(d => d.amount);
    const total   = amounts.reduce((s, v) => s + v, 0);
    const avg     = Math.round(total / (amounts.length || 1));
    const half    = Math.floor(amounts.length / 2);
    const firstHalf  = amounts.slice(0, half).reduce((s, v) => s + v, 0);
    const secondHalf = amounts.slice(half).reduce((s, v) => s + v, 0);
    const trend   = Math.round(((secondHalf - firstHalf) / (firstHalf || 1)) * 100);
    return { total, avg, trend };
  }, [data]);

  const accentColor  = darkMode ? '#818cf8' : '#111827';
  const dimColor     = darkMode ? '#374151' : '#e5e7eb';
  const hoverColor   = darkMode ? '#6366f1' : '#3b82f6';
  const gridColor    = darkMode ? '#1f2937' : '#f9fafb';
  const tickColor    = darkMode ? '#6b7280' : '#9ca3af';

  const sharedAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 11, fill: tickColor },
  };

  const yFormatter = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;

  return (
    <div className={`rounded-2xl shadow-sm border p-6 h-full flex flex-col ${
      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Activité de la plateforme
          </h2>
          <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Volume de tentatives d'examens
          </p>
        </div>

        <div className={`flex p-1 rounded-xl w-fit ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p.key
                  ? (darkMode ? 'bg-gray-600 text-white shadow-lg' : 'bg-white text-gray-900 shadow-sm')
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-10 mb-8 pb-8 border-b border-dashed border-gray-200/50">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Total Tentatives
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{total}</span>
          </div>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Moyenne
          </p>
          <p className="text-xl font-bold">{avg}</p>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Tendance
          </p>
          <div className={`flex items-center gap-1.5 font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart 
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) setActiveIndex(state.activeTooltipIndex);
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="4 4" />
              <XAxis dataKey="label" {...sharedAxisProps} />
              <YAxis tickFormatter={yFormatter} {...sharedAxisProps} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                content={<CustomTooltip darkMode={darkMode} />} 
              />
              <Bar 
                dataKey="amount" 
                radius={[6, 6, 0, 0]}
                barSize={32}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === activeIndex ? hoverColor : accentColor} 
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="4 4" />
              <XAxis dataKey="label" {...sharedAxisProps} />
              <YAxis tickFormatter={yFormatter} {...sharedAxisProps} />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={accentColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-center">
        <div className={`flex p-1 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button 
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'bar' ? (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-900 text-white') : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          </button>
          <button 
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'area' ? (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-900 text-white') : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionChart;
