import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/shared/Sidebar';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import EditorPanel from './components/editor/EditorPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {activeTab === 'analytics' ? <AnalyticsDashboard /> : <EditorPanel />}
      </main>
    </div>
  );
}
