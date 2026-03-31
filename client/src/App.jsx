import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/shared/Sidebar';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import EditorPanel from './components/editor/EditorPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1C1F2B', color: '#E2E8F0', border: '1px solid #2A2D3A', fontSize: '13px' },
      }} />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {activeTab === 'analytics' ? <AnalyticsDashboard /> : <EditorPanel />}
      </main>
    </div>
  );
}
