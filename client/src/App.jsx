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
          style: { background: '#fff', color: '#111827', border: '1px solid #E5E7EB', fontFamily: 'DM Sans', fontWeight: 500 },
          success: { iconTheme: { primary: '#2E5A88', secondary: '#fff' } },
          error: { iconTheme: { primary: '#C4703F', secondary: '#fff' } },
        }}
      />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto bg-surface-bg">
        {activeTab === 'analytics' ? <AnalyticsDashboard /> : <EditorPanel />}
      </main>
    </div>
  );
}
