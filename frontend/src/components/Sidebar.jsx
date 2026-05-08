import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Brain,
  Rocket,
  ScrollText,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { path: '/ai-suggestions', label: 'AI Insights', icon: Brain },
  { path: '/deployments', label: 'Deployments', icon: Rocket },
  { path: '/logs', label: 'Event Logs', icon: ScrollText },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
        bg-dark-800/80 backdrop-blur-2xl border-r border-white/5 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center flex-shrink-0 shadow-neon-cyan">
          <Zap className="w-5 h-5 text-dark-900" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold text-gradient-cyan tracking-wide">LAUNCHLOOP</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">CI/CD Automation</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-neon-cyan rounded-r-full" />
              )}
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-neon-cyan' : 'text-gray-500 group-hover:text-gray-300'}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="glass-card p-3 mb-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <div className="status-dot-success" />
              <span className="text-xs font-medium text-gray-300">System Online</span>
            </div>
            <p className="text-[10px] text-gray-500 ml-4">All services operational</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
