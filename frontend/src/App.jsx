import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PipelineMonitor from './pages/PipelineMonitor';
import AISuggestions from './pages/AISuggestions';
import DeploymentPanel from './pages/DeploymentPanel';
import EventLogs from './pages/EventLogs';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipelines" element={<PipelineMonitor />} />
              <Route path="/ai-suggestions" element={<AISuggestions />} />
              <Route path="/deployments" element={<DeploymentPanel />} />
              <Route path="/logs" element={<EventLogs />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              <span className="text-gradient-cyan font-semibold">LAUNCHLOOP</span>
              {' '}&middot; AI-Powered CI/CD Automation &middot; Built with Gemini AI + PyGithub + FastAPI
            </p>
          </footer>
        </main>
      </div>
    </Router>
  );
}
