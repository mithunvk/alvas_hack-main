import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'cyan', trend = null, subtitle = '' }) {
  const colorMap = {
    cyan: {
      iconBg: 'bg-neon-cyan/10',
      iconText: 'text-neon-cyan',
      border: 'border-neon-cyan/10',
      glow: 'shadow-neon-cyan',
    },
    green: {
      iconBg: 'bg-neon-green/10',
      iconText: 'text-neon-green',
      border: 'border-neon-green/10',
      glow: 'shadow-neon-green',
    },
    red: {
      iconBg: 'bg-neon-red/10',
      iconText: 'text-neon-red',
      border: 'border-neon-red/10',
      glow: 'shadow-neon-red',
    },
    purple: {
      iconBg: 'bg-neon-purple/10',
      iconText: 'text-neon-purple',
      border: 'border-neon-purple/10',
      glow: 'shadow-neon-purple',
    },
    blue: {
      iconBg: 'bg-neon-blue/10',
      iconText: 'text-neon-blue',
      border: 'border-neon-blue/10',
      glow: 'shadow-neon-blue',
    },
    orange: {
      iconBg: 'bg-neon-orange/10',
      iconText: 'text-neon-orange',
      border: 'border-neon-orange/10',
      glow: '',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`glass-card-hover p-5 ${c.border} animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.iconText}`} strokeWidth={1.5} />
        </div>
      </div>
      {trend !== null && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
          {trend > 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3.5 h-3.5 text-neon-red" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-gray-500" />
          )}
          <span className={`text-xs font-medium ${trend > 0 ? 'text-neon-green' : trend < 0 ? 'text-neon-red' : 'text-gray-500'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last week
          </span>
        </div>
      )}
    </div>
  );
}
