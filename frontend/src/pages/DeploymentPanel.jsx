import { useState, useEffect } from 'react';
import { Rocket, Server, Shield, CheckCircle2, Clock, AlertTriangle, Loader2, Lock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { deployStaging, deployProduction, getDeployStatus, getCurrentBranch } from '../api/client';

const demoHistory = [
  { id: 1, env: 'staging', status: 'success', branch: 'main', timestamp: '2026-05-08T12:30:00Z', commit: 'c9e2b5d', deployer: 'LaunchLoop Bot' },
  { id: 2, env: 'production', status: 'success', branch: 'main', timestamp: '2026-05-07T18:00:00Z', commit: 'f2a1b3c', deployer: 'admin@team.com' },
  { id: 3, env: 'staging', status: 'failure', branch: 'feature/api', timestamp: '2026-05-07T15:30:00Z', commit: 'a1b2c3d', deployer: 'LaunchLoop Bot' },
];

export default function DeploymentPanel() {
  const [deployStatus, setDeployStatus] = useState({
    staging: { status: 'success', last_deployed: '2026-05-08T12:30:00Z', branch: 'main' },
    production: { status: 'success', last_deployed: '2026-05-07T18:00:00Z', branch: 'main' },
  });
  const [branch, setBranch] = useState('main');
  const [prodApproved, setProdApproved] = useState(false);
  const [deploying, setDeploying] = useState(null);
  const [history, setHistory] = useState(demoHistory);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [data, git] = await Promise.all([getDeployStatus(), getCurrentBranch()]);
        if (data.staging) setDeployStatus(data);
        if (git.branch) setBranch(git.branch);
      } catch (err) { /* demo */ }
    };
    fetch();
  }, []);

  const handleDeployStaging = async () => {
    setDeploying('staging'); setResult(null);
    try {
      const res = await deployStaging(branch);
      setResult({ env: 'staging', ...res });
      setHistory(prev => [{ id: Date.now(), env: 'staging', status: 'running', branch, timestamp: new Date().toISOString(), commit: '—', deployer: 'You' }, ...prev]);
    } catch (err) { setResult({ env: 'staging', status: 'error', message: err.message }); }
    finally { setDeploying(null); }
  };

  const handleDeployProd = async () => {
    if (!prodApproved) { setResult({ env: 'production', status: 'pending_approval', message: 'Please approve production deployment first.' }); return; }
    setDeploying('production'); setResult(null);
    try {
      const res = await deployProduction(branch, true, 'dashboard-user');
      setResult({ env: 'production', ...res });
      setHistory(prev => [{ id: Date.now(), env: 'production', status: 'running', branch, timestamp: new Date().toISOString(), commit: '—', deployer: 'You' }, ...prev]);
    } catch (err) { setResult({ env: 'production', status: 'error', message: err.message }); }
    finally { setDeploying(null); setProdApproved(false); }
  };

  const timeAgo = (ts) => { const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m/60)}h ago` : `${Math.floor(m/1440)}d ago`; };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Rocket className="w-7 h-7 text-neon-green" />Deployment Control
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage staging and production deployments with safety gates</p>
      </div>

      {/* Environment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staging */}
        <div className="glass-card overflow-hidden neon-border-green">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Staging Environment</h3>
                <p className="text-xs text-gray-500">Automatic deployment on CI success</p>
              </div>
            </div>
            <StatusBadge status={deployStatus.staging?.status || 'not_deployed'} />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Branch</span><span className="text-white font-mono">{deployStatus.staging?.branch || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Last Deployed</span><span className="text-white">{deployStatus.staging?.last_deployed ? timeAgo(deployStatus.staging.last_deployed) : 'Never'}</span>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <input type="text" value={branch} onChange={e => setBranch(e.target.value)} placeholder="Branch name" className="flex-1 px-3 py-2 bg-dark-600 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-neon-green/30" />
              </div>
              <button onClick={handleDeployStaging} disabled={deploying === 'staging'} className="btn-success w-full flex items-center justify-center gap-2">
                {deploying === 'staging' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Deploy to Staging
              </button>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="glass-card overflow-hidden neon-border-red">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-red/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neon-red" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Production Environment</h3>
                <p className="text-xs text-gray-500">Requires manual approval</p>
              </div>
            </div>
            <StatusBadge status={deployStatus.production?.status || 'not_deployed'} />
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Branch</span><span className="text-white font-mono">{deployStatus.production?.branch || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Last Deployed</span><span className="text-white">{deployStatus.production?.last_deployed ? timeAgo(deployStatus.production.last_deployed) : 'Never'}</span>
            </div>
            <div className="pt-3 border-t border-white/5 space-y-3">
              {/* Approval Gate */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-neon-orange/5 border border-neon-orange/20 cursor-pointer group">
                <input type="checkbox" checked={prodApproved} onChange={e => setProdApproved(e.target.checked)} className="w-4 h-4 accent-neon-orange" />
                <div>
                  <p className="text-xs font-semibold text-neon-orange flex items-center gap-1.5"><Lock className="w-3 h-3" />Manual Approval Required</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">I confirm this deployment is ready for production</p>
                </div>
              </label>
              <button onClick={handleDeployProd} disabled={deploying === 'production' || !prodApproved} className="btn-danger w-full flex items-center justify-center gap-2">
                {deploying === 'production' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Deploy to Production
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Toast */}
      {result && (
        <div className={`glass-card p-4 animate-slide-up ${result.status === 'error' || result.status === 'pending_approval' ? 'neon-border-red' : 'neon-border-green'}`}>
          <div className="flex items-center gap-3">
            {result.status === 'error' || result.status === 'pending_approval' ? <AlertTriangle className="w-5 h-5 text-neon-orange" /> : <CheckCircle2 className="w-5 h-5 text-neon-green" />}
            <div>
              <p className="text-sm font-semibold text-white">{result.env?.charAt(0).toUpperCase() + result.env?.slice(1)} Deployment</p>
              <p className="text-xs text-gray-400">{result.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Deployment History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />Deployment History</h3>
        </div>
        <div className="divide-y divide-white/5">
          {history.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02]">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.env === 'production' ? 'bg-neon-red/10' : 'bg-neon-green/10'}`}>
                {d.env === 'production' ? <Shield className="w-4 h-4 text-neon-red" /> : <Server className="w-4 h-4 text-neon-green" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{d.env.charAt(0).toUpperCase() + d.env.slice(1)}</p>
                <p className="text-xs text-gray-500">{d.branch} • {d.commit} • {d.deployer}</p>
              </div>
              <StatusBadge status={d.status} size="xs" />
              <span className="text-xs text-gray-500">{timeAgo(d.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
